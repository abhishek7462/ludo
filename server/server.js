require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const User = require('./models/User');
const Game = require('./models/Game');
const Transaction = require('./models/Transaction');
const LudoGame = require('./gameLogic/ludoLogic');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Game management
const activeGames = new Map();
const waitingPlayers = new Map(); // betAmount -> [players]

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_betting_queue', async (data) => {
    try {
      const { userId, betAmount } = data;
      const user = await User.findById(userId);
      
      if (!user) {
        socket.emit('error', { message: 'User not found' });
        return;
      }

      if (user.wallet < betAmount) {
        socket.emit('error', { message: 'Insufficient balance' });
        return;
      }

      const playerData = {
        userId: user._id,
        username: user.username,
        socketId: socket.id,
        betAmount
      };

      // Check for waiting players with same bet amount
      if (!waitingPlayers.has(betAmount)) {
        waitingPlayers.set(betAmount, []);
      }

      const waiting = waitingPlayers.get(betAmount);
      
      if (waiting.length > 0) {
        // Match found, start game
        const opponent = waiting.shift();
        const gameId = uuidv4();
        
        // Create new game
        const ludoGame = new LudoGame(gameId, betAmount);
        ludoGame.addPlayer(opponent);
        ludoGame.addPlayer(playerData);
        
        activeGames.set(gameId, ludoGame);

        // Deduct bet amounts
        await User.findByIdAndUpdate(user._id, { $inc: { wallet: -betAmount } });
        await User.findByIdAndUpdate(opponent.userId, { $inc: { wallet: -betAmount } });

        // Create transactions
        await Transaction.create({
          userId: user._id,
          gameId,
          type: 'bet',
          amount: betAmount,
          description: 'Bet placed for Ludo game'
        });

        await Transaction.create({
          userId: opponent.userId,
          gameId,
          type: 'bet',
          amount: betAmount,
          description: 'Bet placed for Ludo game'
        });

        // Save game to database
        await Game.create({
          gameId,
          players: [opponent, playerData],
          betAmount,
          status: 'active',
          startedAt: new Date()
        });

        // Join both players to game room
        socket.join(gameId);
        io.to(opponent.socketId).emit('game_matched', { gameId, gameState: ludoGame.getGameState() });
        socket.emit('game_matched', { gameId, gameState: ludoGame.getGameState() });
        
        io.to(opponent.socketId).join(gameId);
      } else {
        // Add to waiting queue
        waiting.push(playerData);
        socket.emit('waiting_for_opponent', { message: 'Waiting for opponent...' });
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('roll_dice', (data) => {
    try {
      const { gameId, userId } = data;
      const game = activeGames.get(gameId);
      
      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      const dice = game.rollDice();
      io.to(gameId).emit('dice_rolled', { dice, userId, gameState: game.getGameState() });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('make_move', async (data) => {
    try {
      const { gameId, userId, pieceIndex } = data;
      const game = activeGames.get(gameId);
      
      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      const result = game.makeMove(userId, pieceIndex);
      
      if (result.winner) {
        // Game completed
        const winAmount = game.betAmount * 2;
        
        // Update winner's wallet
        await User.findByIdAndUpdate(result.winner.userId, { 
          $inc: { 
            wallet: winAmount,
            totalGamesWon: 1,
            totalGamesPlayed: 1,
            totalEarnings: winAmount
          }
        });

        // Update loser's stats
        const loser = game.players.find(p => p.userId !== result.winner.userId);
        await User.findByIdAndUpdate(loser.userId, { 
          $inc: { totalGamesPlayed: 1 }
        });

        // Create win transaction
        await Transaction.create({
          userId: result.winner.userId,
          gameId,
          type: 'win',
          amount: winAmount,
          description: 'Won Ludo game'
        });

        // Update game in database
        await Game.findOneAndUpdate(
          { gameId },
          { 
            status: 'completed',
            winner: {
              userId: result.winner.userId,
              username: result.winner.username
            },
            completedAt: new Date()
          }
        );

        io.to(gameId).emit('game_completed', { 
          winner: result.winner,
          winAmount,
          gameState: game.getGameState()
        });

        activeGames.delete(gameId);
      } else {
        io.to(gameId).emit('move_made', { 
          userId,
          pieceIndex,
          gameState: game.getGameState()
        });
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove from waiting queues
    waitingPlayers.forEach((players, betAmount) => {
      const index = players.findIndex(p => p.socketId === socket.id);
      if (index !== -1) {
        players.splice(index, 1);
        if (players.length === 0) {
          waitingPlayers.delete(betAmount);
        }
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
class LudoGame {
  constructor(gameId, betAmount) {
    this.gameId = gameId;
    this.betAmount = betAmount;
    this.players = [];
    this.currentPlayer = 0;
    this.dice = 0;
    this.board = this.initializeBoard();
    this.gameStatus = 'waiting';
  }

  initializeBoard() {
    const board = {};
    const colors = ['red', 'blue', 'yellow', 'green'];
    
    colors.forEach(color => {
      board[color] = {
        home: [0, 1, 2, 3], // pieces at home
        safe: [], // pieces in safe zone
        finished: [] // pieces that finished
      };
    });
    
    return board;
  }

  addPlayer(player) {
    if (this.players.length >= 2) {
      throw new Error('Game is full');
    }
    
    const colors = ['red', 'blue'];
    player.color = colors[this.players.length];
    player.position = this.players.length;
    
    this.players.push(player);
    
    if (this.players.length === 2) {
      this.gameStatus = 'active';
    }
  }

  rollDice() {
    this.dice = Math.floor(Math.random() * 6) + 1;
    return this.dice;
  }

  makeMove(playerId, pieceIndex) {
    const playerIndex = this.players.findIndex(p => p.userId === playerId);
    if (playerIndex !== this.currentPlayer) {
      throw new Error('Not your turn');
    }

    const player = this.players[playerIndex];
    const color = player.color;
    
    // Simple move logic - in a real implementation, this would be much more complex
    if (this.dice === 6 && this.board[color].home.includes(pieceIndex)) {
      // Move piece out of home
      this.board[color].home = this.board[color].home.filter(p => p !== pieceIndex);
      this.board[color].safe.push({ piece: pieceIndex, position: 1 });
    } else if (this.board[color].safe.some(p => p.piece === pieceIndex)) {
      // Move piece forward
      const piece = this.board[color].safe.find(p => p.piece === pieceIndex);
      piece.position += this.dice;
      
      if (piece.position >= 57) {
        // Piece finished
        this.board[color].safe = this.board[color].safe.filter(p => p.piece !== pieceIndex);
        this.board[color].finished.push(pieceIndex);
      }
    }

    // Check for win condition
    if (this.board[color].finished.length === 4) {
      this.gameStatus = 'completed';
      return { winner: player, gameStatus: this.gameStatus };
    }

    // Next player's turn (unless rolled 6)
    if (this.dice !== 6) {
      this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
    }

    return { gameStatus: this.gameStatus, currentPlayer: this.currentPlayer };
  }

  getGameState() {
    return {
      gameId: this.gameId,
      players: this.players,
      currentPlayer: this.currentPlayer,
      dice: this.dice,
      board: this.board,
      gameStatus: this.gameStatus,
      betAmount: this.betAmount
    };
  }
}

module.exports = LudoGame;
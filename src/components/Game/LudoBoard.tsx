import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Crown, Trophy } from 'lucide-react';

interface LudoBoardProps {
  gameId: string;
  onGameEnd: () => void;
}

const LudoBoard: React.FC<LudoBoardProps> = ({ gameId, onGameEnd }) => {
  const { user, updateWallet } = useAuth();
  const { socket } = useSocket();
  const [gameState, setGameState] = useState<any>(null);
  const [diceValue, setDiceValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [gameResult, setGameResult] = useState<any>(null);

  const getDiceIcon = (value: number) => {
    const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
    const Icon = icons[value - 1];
    return <Icon className="w-12 h-12" />;
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('dice_rolled', (data) => {
      setDiceValue(data.dice);
      setGameState(data.gameState);
      setIsRolling(false);
    });

    socket.on('move_made', (data) => {
      setGameState(data.gameState);
    });

    socket.on('game_completed', (data) => {
      setGameResult(data);
      if (data.winner.userId === user?.id) {
        updateWallet(user.wallet + data.winAmount);
      }
    });

    socket.on('game_matched', (data) => {
      setGameState(data.gameState);
    });

    return () => {
      socket.off('dice_rolled');
      socket.off('move_made');
      socket.off('game_completed');
      socket.off('game_matched');
    };
  }, [socket, user, updateWallet]);

  const rollDice = () => {
    if (!socket || isRolling) return;
    
    setIsRolling(true);
    socket.emit('roll_dice', {
      gameId,
      userId: user?.id
    });
  };

  const makeMove = (pieceIndex: number) => {
    if (!socket) return;
    
    socket.emit('make_move', {
      gameId,
      userId: user?.id,
      pieceIndex
    });
  };

  const isCurrentPlayer = () => {
    if (!gameState || !user) return false;
    const playerIndex = gameState.players.findIndex((p: any) => p.userId === user.id);
    return gameState.currentPlayer === playerIndex;
  };

  if (gameResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20 text-center">
          <div className={`p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center ${
            gameResult.winner.userId === user?.id 
              ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
              : 'bg-gradient-to-r from-gray-400 to-gray-600'
          }`}>
            {gameResult.winner.userId === user?.id ? (
              <Trophy className="w-12 h-12 text-white" />
            ) : (
              <Crown className="w-12 h-12 text-white" />
            )}
          </div>
          
          <h1 className={`text-3xl font-bold mb-4 ${
            gameResult.winner.userId === user?.id ? 'text-yellow-400' : 'text-gray-300'
          }`}>
            {gameResult.winner.userId === user?.id ? 'You Won!' : 'You Lost!'}
          </h1>
          
          <p className="text-white text-lg mb-2">Winner: {gameResult.winner.username}</p>
          <p className="text-gray-300 mb-6">Prize Money: ₹{gameResult.winAmount}</p>
          
          {gameResult.winner.userId === user?.id && (
            <p className="text-green-400 font-bold mb-6">
              ₹{gameResult.winAmount} added to your wallet!
            </p>
          )}
          
          <button
            onClick={onGameEnd}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6 border border-white/20">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Ludo Game</h1>
              <p className="text-gray-300">Bet Amount: ₹{gameState.betAmount}</p>
            </div>
            <div className="text-right">
              <p className="text-white font-bold">Your Turn: {isCurrentPlayer() ? 'Yes' : 'No'}</p>
              <p className="text-gray-300">Current Player: {gameState.players[gameState.currentPlayer]?.username}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/20 aspect-square">
              <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 rounded-lg p-4 relative">
                {/* Simplified Ludo Board Visual */}
                <div className="grid grid-cols-15 gap-1 h-full">
                  {/* This is a simplified visual representation */}
                  <div className="text-white text-center text-lg font-bold col-span-15 py-4">
                    🎯 Ludo Board 🎯
                  </div>
                  
                  {gameState.players.map((player: any, index: number) => (
                    <div key={index} className={`p-2 rounded ${
                      player.color === 'red' ? 'bg-red-500' : 'bg-blue-500'
                    } text-white text-center col-span-7`}>
                      <div className="font-bold">{player.username}</div>
                      <div className="text-sm">
                        Home: {gameState.board[player.color]?.home?.length || 0} |
                        Playing: {gameState.board[player.color]?.safe?.length || 0} |
                        Finished: {gameState.board[player.color]?.finished?.length || 0}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Game Controls */}
          <div className="space-y-6">
            {/* Dice Section */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-white font-bold mb-4 text-center">Dice</h3>
              <div className="flex flex-col items-center space-y-4">
                <div className={`text-white p-4 rounded-lg ${isRolling ? 'animate-bounce' : ''}`}>
                  {getDiceIcon(diceValue)}
                </div>
                <button
                  onClick={rollDice}
                  disabled={!isCurrentPlayer() || isRolling}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-3 rounded-lg hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isRolling ? 'Rolling...' : 'Roll Dice'}
                </button>
              </div>
            </div>

            {/* Pieces Control */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-white font-bold mb-4 text-center">Your Pieces</h3>
              <div className="grid grid-cols-2 gap-3">
                {[0, 1, 2, 3].map((pieceIndex) => (
                  <button
                    key={pieceIndex}
                    onClick={() => makeMove(pieceIndex)}
                    disabled={!isCurrentPlayer()}
                    className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold py-2 px-4 rounded-lg hover:from-yellow-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Piece {pieceIndex + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Game Info */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-white font-bold mb-4">Game Info</h3>
              <div className="space-y-2 text-gray-300">
                <p>Game ID: {gameId.slice(0, 8)}...</p>
                <p>Players: {gameState.players.length}/2</p>
                <p>Status: {gameState.gameStatus}</p>
                <p>Last Dice: {diceValue}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LudoBoard;
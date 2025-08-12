import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Coins, Users, Trophy, Clock } from 'lucide-react';

interface GameLobbyProps {
  onGameStart: (gameId: string) => void;
}

const GameLobby: React.FC<GameLobbyProps> = ({ onGameStart }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [betAmount, setBetAmount] = useState(50);
  const [isWaiting, setIsWaiting] = useState(false);
  const [message, setMessage] = useState('');

  const betOptions = [50, 100, 200, 500, 1000];

  useEffect(() => {
    if (!socket) return;

    socket.on('game_matched', (data) => {
      setIsWaiting(false);
      onGameStart(data.gameId);
    });

    socket.on('waiting_for_opponent', (data) => {
      setIsWaiting(true);
      setMessage(data.message);
    });

    socket.on('error', (data) => {
      setIsWaiting(false);
      setMessage(data.message);
      setTimeout(() => setMessage(''), 3000);
    });

    return () => {
      socket.off('game_matched');
      socket.off('waiting_for_opponent');
      socket.off('error');
    };
  }, [socket, onGameStart]);

  const handleJoinQueue = () => {
    if (!socket || !user) return;

    if (user.wallet < betAmount) {
      setMessage('Insufficient balance!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    socket.emit('join_betting_queue', {
      userId: user.id,
      betAmount
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-2xl border border-white/20">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Ludo Arena</h1>
          <p className="text-gray-300 text-lg">Place your bet and find an opponent</p>
        </div>

        <div className="bg-white/5 rounded-xl p-6 mb-8 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 rounded-full w-3 h-3"></div>
              <span className="text-white font-medium">Welcome, {user?.username}!</span>
            </div>
            <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1 rounded-full">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-bold">₹{user?.wallet}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-white font-medium mb-4 text-lg">Choose Your Bet Amount:</label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {betOptions.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setBetAmount(amount)}
                  className={`p-4 rounded-xl font-bold text-lg transition-all duration-200 border-2 ${
                    betAmount === amount
                      ? 'bg-yellow-500 border-yellow-400 text-white transform scale-105'
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30'
                  }`}
                  disabled={isWaiting}
                >
                  ₹{amount}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-500/20 rounded-xl p-6 border border-blue-500/30">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Game Rules
            </h3>
            <ul className="text-gray-300 space-y-2 text-sm">
              <li>• Winner takes 2x the bet amount</li>
              <li>• Get all 4 pieces to home to win</li>
              <li>• Roll 6 to get pieces out</li>
              <li>• Game is automatically matched with same bet</li>
            </ul>
          </div>

          {message && (
            <div className={`p-4 rounded-lg text-center font-medium ${
              message.includes('Insufficient') || message.includes('error') 
                ? 'bg-red-500/20 border border-red-500/50 text-red-300'
                : 'bg-blue-500/20 border border-blue-500/50 text-blue-300'
            }`}>
              {message}
            </div>
          )}

          {isWaiting ? (
            <div className="text-center">
              <div className="bg-orange-500/20 border border-orange-500/50 rounded-xl p-6">
                <Clock className="w-12 h-12 text-orange-400 mx-auto mb-4 animate-spin" />
                <p className="text-white font-bold text-xl mb-2">Finding Opponent...</p>
                <p className="text-gray-300">Please wait while we match you with another player</p>
              </div>
            </div>
          ) : (
            <button
              onClick={handleJoinQueue}
              disabled={!socket}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white font-bold py-4 rounded-xl hover:from-green-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
            >
              Play Now - Bet ₹{betAmount}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameLobby;
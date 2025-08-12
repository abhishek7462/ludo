import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import GameLobby from './components/Game/GameLobby';
import LudoBoard from './components/Game/LudoBoard';
import AdminDashboard from './components/Admin/AdminDashboard';
import { LogOut, Settings } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, logout } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  const handleGameStart = (gameId: string) => {
    setCurrentGameId(gameId);
  };

  const handleGameEnd = () => {
    setCurrentGameId(null);
  };

  if (!user) {
    return (
      <>
        {isLogin ? (
          <Login onToggle={() => setIsLogin(false)} />
        ) : (
          <Register onToggle={() => setIsLogin(true)} />
        )}
      </>
    );
  }

  if (showAdminDashboard && user.role === 'admin') {
    return (
      <div>
        <div className="bg-gray-800 p-4 flex justify-between items-center">
          <h1 className="text-white text-xl font-bold">Ludo Gaming Platform</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowAdminDashboard(false)}
              className="text-white hover:text-gray-300 transition-colors"
            >
              Back to Game
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-white hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  if (currentGameId) {
    return (
      <SocketProvider>
        <div>
          <div className="bg-gray-800/50 backdrop-blur p-4 flex justify-between items-center absolute top-0 left-0 right-0 z-10">
            <h1 className="text-white text-xl font-bold">Ludo Arena</h1>
            <div className="flex gap-4">
              {user.role === 'admin' && (
                <button
                  onClick={() => setShowAdminDashboard(true)}
                  className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Admin
                </button>
              )}
              <button
                onClick={() => setCurrentGameId(null)}
                className="text-white hover:text-red-400 transition-colors"
              >
                Leave Game
              </button>
            </div>
          </div>
          <LudoBoard gameId={currentGameId} onGameEnd={handleGameEnd} />
        </div>
      </SocketProvider>
    );
  }

  return (
    <SocketProvider>
      <div>
        <div className="bg-gray-800/50 backdrop-blur p-4 flex justify-between items-center absolute top-0 left-0 right-0 z-10">
          <h1 className="text-white text-xl font-bold">Ludo Arena</h1>
          <div className="flex gap-4">
            {user.role === 'admin' && (
              <button
                onClick={() => setShowAdminDashboard(true)}
                className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Admin Panel
              </button>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-2 text-white hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
        <GameLobby onGameStart={handleGameStart} />
      </div>
    </SocketProvider>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, GamepadIcon, DollarSign, TrendingUp, Eye, EyeOff } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchGames = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/games', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setGames(data);
      }
    } catch (error) {
      console.error('Failed to fetch games:', error);
    }
  };

  const toggleUser = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/users/${userId}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        fetchUsers(); // Refresh users list
      }
    } catch (error) {
      console.error('Failed to toggle user:', error);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Access Denied - Admin Only</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-6 border-b border-gray-700">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-400 mt-2">Manage your Ludo gaming platform</p>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 min-h-screen p-6">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                activeTab === 'dashboard' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              <TrendingUp className="inline w-5 h-5 mr-3" />
              Dashboard
            </button>
            <button
              onClick={() => {
                setActiveTab('users');
                fetchUsers();
              }}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                activeTab === 'users' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              <Users className="inline w-5 h-5 mr-3" />
              Users
            </button>
            <button
              onClick={() => {
                setActiveTab('games');
                fetchGames();
              }}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                activeTab === 'games' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              <GamepadIcon className="inline w-5 h-5 mr-3" />
              Games
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeTab === 'dashboard' && stats && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Users</p>
                      <p className="text-3xl font-bold">{stats.totalUsers}</p>
                    </div>
                    <Users className="w-12 h-12 text-blue-500" />
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Active Users</p>
                      <p className="text-3xl font-bold text-green-400">{stats.activeUsers}</p>
                    </div>
                    <Users className="w-12 h-12 text-green-500" />
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Games</p>
                      <p className="text-3xl font-bold">{stats.totalGames}</p>
                    </div>
                    <GamepadIcon className="w-12 h-12 text-purple-500" />
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Bets</p>
                      <p className="text-3xl font-bold text-yellow-400">₹{stats.totalBets}</p>
                    </div>
                    <DollarSign className="w-12 h-12 text-yellow-500" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-xl font-bold mb-4">Game Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Completed Games:</span>
                      <span className="font-bold">{stats.completedGames}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Active Games:</span>
                      <span className="font-bold text-green-400">{stats.activeGames}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Winnings:</span>
                      <span className="font-bold text-yellow-400">₹{stats.totalWinnings}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-xl font-bold mb-4">Platform Health</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">User Retention:</span>
                      <span className="font-bold text-green-400">
                        {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Game Completion Rate:</span>
                      <span className="font-bold text-blue-400">
                        {((stats.completedGames / stats.totalGames) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">User Management</h2>
              <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Wallet</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Games</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {users.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium">{user.username}</div>
                              <div className="text-sm text-gray-400">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="text-yellow-400 font-bold">₹{user.wallet}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div>{user.totalGamesPlayed} played</div>
                            <div className="text-green-400">{user.totalGamesWon} won</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              user.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => toggleUser(user._id)}
                              className={`p-2 rounded-lg transition-colors ${
                                user.isActive
                                  ? 'bg-red-600 hover:bg-red-700 text-white'
                                  : 'bg-green-600 hover:bg-green-700 text-white'
                              }`}
                            >
                              {user.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'games' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Game Management</h2>
              <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Game ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Players</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Bet Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Winner</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {games.map((game) => (
                        <tr key={game._id} className="hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                            {game.gameId.slice(0, 8)}...
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {game.players.map((p: any, i: number) => (
                              <div key={i}>{p.username}</div>
                            ))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="text-yellow-400 font-bold">₹{game.betAmount}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              game.status === 'completed' ? 'bg-green-100 text-green-800' :
                              game.status === 'active' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {game.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {game.winner?.username || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
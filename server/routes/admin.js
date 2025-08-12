const express = require('express');
const User = require('../models/User');
const Game = require('../models/Game');
const Transaction = require('../models/Transaction');
const { adminAuth } = require('../middleware/auth');
const router = express.Router();

router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({ role: 'user', isActive: true });
    const totalGames = await Game.countDocuments();
    const activeGames = await Game.countDocuments({ status: 'active' });
    const completedGames = await Game.countDocuments({ status: 'completed' });
    
    const totalBets = await Transaction.aggregate([
      { $match: { type: 'bet' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const totalWinnings = await Transaction.aggregate([
      { $match: { type: 'win' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const recentTransactions = await Transaction.find()
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        totalGames,
        activeGames,
        completedGames,
        totalBets: totalBets[0]?.total || 0,
        totalWinnings: totalWinnings[0]?.total || 0
      },
      recentTransactions
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/users/:userId/toggle', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/games', adminAuth, async (req, res) => {
  try {
    const games = await Game.find()
      .populate('players.userId', 'username email')
      .populate('winner.userId', 'username email')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(games);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
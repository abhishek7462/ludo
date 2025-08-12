const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true,
    unique: true
  },
  players: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: String,
    color: String,
    position: Number,
    socketId: String
  }],
  betAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'completed', 'cancelled'],
    default: 'waiting'
  },
  winner: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String
  },
  gameData: {
    board: Array,
    currentPlayer: Number,
    dice: Number,
    moves: Array
  },
  startedAt: Date,
  completedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Game', gameSchema);
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gameId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['bet', 'win', 'refund'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  balanceBefore: Number,
  balanceAfter: Number,
  description: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
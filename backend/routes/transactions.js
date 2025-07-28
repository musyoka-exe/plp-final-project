const express = require('express');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const auth = require('../middleware/Auth');

const router = express.Router();

// Create new transaction
router.post('/create', auth, async (req, res) => {
  try {
    const { receiverEmail, amount, description } = req.body;

    // Validation
    if (!receiverEmail || !amount || !description) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (amount < 1) {
      return res.status(400).json({ message: 'Amount must be at least $1' });
    }

    // Find receiver
    const receiver = await User.findOne({ email: receiverEmail });
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    if (receiver._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot send money to yourself' });
    }

    // Check sender balance (in real app, integrate payment gateway here)
    if (req.user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Create transaction
    const transaction = new Transaction({
      sender: req.user._id,
      receiver: receiver._id,
      amount,
      description,
      senderApproved: true // Auto-approve sender when creating
    });

    await transaction.save();

    // Deduct from sender balance
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { balance: -amount }
    });

    // Populate sender and receiver details
    await transaction.populate(['sender', 'receiver'], 'username email');

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user transactions
router.get('/my-transactions', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    })
    .populate('sender', 'username email')
    .populate('receiver', 'username email')
    .sort({ createdAt: -1 });

    res.json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single transaction
router.get('/:transactionId', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ 
      transactionId: req.params.transactionId,
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    })
    .populate('sender', 'username email')
    .populate('receiver', 'username email');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ transaction });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve/Release funds (receiver action)
router.post('/:transactionId/approve', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ 
      transactionId: req.params.transactionId 
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Only receiver can approve
    if (transaction.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only receiver can approve this transaction' });
    }

    if (transaction.status !== 'IN_ESCROW' && transaction.status !== 'PENDING') {
      return res.status(400).json({ message: 'Transaction cannot be approved in current status' });
    }

    // Update transaction
    transaction.receiverApproved = true;
    transaction.updateStatus();
    await transaction.save();

    // If completed, add money to receiver balance
    if (transaction.status === 'COMPLETED') {
      await User.findByIdAndUpdate(transaction.receiver, {
        $inc: { balance: transaction.netAmount }
      });
    }

    await transaction.populate(['sender', 'receiver'], 'username email');

    res.json({
      message: 'Transaction approved successfully',
      transaction
    });
  } catch (error) {
    console.error('Approve transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel transaction (sender only, before receiver approval)
router.post('/:transactionId/cancel', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ 
      transactionId: req.params.transactionId 
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Only sender can cancel
    if (transaction.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only sender can cancel this transaction' });
    }

    if (transaction.status !== 'PENDING' && transaction.status !== 'IN_ESCROW') {
      return res.status(400).json({ message: 'Transaction cannot be cancelled in current status' });
    }

    if (transaction.receiverApproved) {
      return res.status(400).json({ message: 'Cannot cancel after receiver approval' });
    }

    // Update transaction status
    transaction.status = 'CANCELLED';
    await transaction.save();

    // Refund sender
    await User.findByIdAndUpdate(transaction.sender, {
      $inc: { balance: transaction.amount }
    });

    await transaction.populate(['sender', 'receiver'], 'username email');

    res.json({
      message: 'Transaction cancelled successfully',
      transaction
    });
  } catch (error) {
    console.error('Cancel transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add funds to balance (for demo purposes)
router.post('/add-funds', auth, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { balance: amount }
    });

    const updatedUser = await User.findById(req.user._id).select('-password');

    res.json({
      message: 'Funds added successfully',
      balance: updatedUser.balance
    });
  } catch (error) {
    console.error('Add funds error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
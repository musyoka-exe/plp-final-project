const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  commission: {
    type: Number,
    default: function() {
      return this.amount * 0.03; // 3% commission
    }
  },
  netAmount: {
    type: Number,
    default: function() {
      return this.amount - (this.amount * 0.03);
    }
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['PENDING', 'IN_ESCROW', 'COMPLETED', 'CANCELLED', 'DISPUTED'],
    default: 'PENDING'
  },
  senderApproved: {
    type: Boolean,
    default: false
  },
  receiverApproved: {
    type: Boolean,
    default: false
  },
  transactionId: {
    type: String,
    unique: true,
    default: function() {
      return 'ESK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
  },
  completedAt: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// Calculate commission and net amount before saving
transactionSchema.pre('save', function(next) {
  if (this.isModified('amount')) {
    this.commission = this.amount * 0.03;
    this.netAmount = this.amount - this.commission;
  }
  next();
});

// Update status based on approvals
transactionSchema.methods.updateStatus = function() {
  if (this.senderApproved && !this.receiverApproved) {
    this.status = 'IN_ESCROW';
  } else if (this.senderApproved && this.receiverApproved) {
    this.status = 'COMPLETED';
    this.completedAt = new Date();
  }
};

module.exports = mongoose.model('Transaction', transactionSchema);
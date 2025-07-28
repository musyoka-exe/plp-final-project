import React, { useState } from 'react';
import axios from 'axios';

const CreateTransaction = ({ onTransactionCreated }) => {
  const [formData, setFormData] = useState({
    receiverEmail: '',
    amount: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const amount = parseFloat(formData.amount);
      if (amount < 1) {
        setError('Amount must be at least $1');
        setLoading(false);
        return;
      }

      const response = await axios.post('/api/transactions/create', {
        ...formData,
        amount
      });

      setSuccess('Transaction created successfully!');
      setFormData({
        receiverEmail: '',
        amount: '',
        description: ''
      });

      // Refresh parent component
      if (onTransactionCreated) {
        onTransactionCreated();
      }

    } catch (error) {
      setError(error.response?.data?.message || 'Error creating transaction');
    } finally {
      setLoading(false);
    }
  };

  const commission = formData.amount ? (parseFloat(formData.amount) * 0.03).toFixed(2) : '0.00';
  const netAmount = formData.amount ? (parseFloat(formData.amount) - (parseFloat(formData.amount) * 0.03)).toFixed(2) : '0.00';

  return (
    <div className="create-transaction">
      <h3>Send Money via Escrow</h3>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="transaction-form">
        <div className="form-group">
          <label htmlFor="receiverEmail">Receiver's Email</label>
          <input
            type="email"
            id="receiverEmail"
            name="receiverEmail"
            value={formData.receiverEmail}
            onChange={handleChange}
            required
            placeholder="Enter receiver's email address"
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount ($)</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            min="1"
            step="0.01"
            placeholder="Enter amount to send"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="3"
            maxLength="500"
            placeholder="Describe what this payment is for"
          />
        </div>

        {formData.amount && (
          <div className="transaction-summary">
            <h4>Transaction Summary</h4>
            <div className="summary-row">
              <span>Amount:</span>
              <span>${parseFloat(formData.amount).toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Commission (3%):</span>
              <span>-${commission}</span>
            </div>
            <div className="summary-row total">
              <span>Receiver will get:</span>
              <span>${netAmount}</span>
            </div>
          </div>
        )}

        <button 
          type="submit" 
          className="create-transaction-btn"
          disabled={loading}
        >
          {loading ? 'Creating Transaction...' : 'Create Escrow Transaction'}
        </button>
      </form>

      <div className="how-it-works">
        <h4>How it works:</h4>
        <ol>
          <li>You send money to escrow</li>
          <li>Receiver gets notified</li>
          <li>Money is held securely until receiver approves</li>
          <li>Once approved, funds are released to receiver</li>
          <li>ESKRO takes 3% commission</li>
        </ol>
      </div>
    </div>
  );
};

export default CreateTransaction;
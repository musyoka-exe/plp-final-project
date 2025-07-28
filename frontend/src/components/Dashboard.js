import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CreateTransaction from './CreateTransaction';
import axios from 'axios';

const Dashboard = () => {
  const { user, logout, updateUserBalance } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateTransaction, setShowCreateTransaction] = useState(false);
  const [fundAmount, setFundAmount] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/api/transactions/my-transactions');
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTransaction = async (transactionId) => {
    try {
      await axios.post(`/api/transactions/${transactionId}/approve`);
      fetchTransactions(); // Refresh transactions
    } catch (error) {
      alert(error.response?.data?.message || 'Error approving transaction');
    }
  };

  const handleCancelTransaction = async (transactionId) => {
    try {
      await axios.post(`/api/transactions/${transactionId}/cancel`);
      fetchTransactions(); // Refresh transactions
    } catch (error) {
      alert(error.response?.data?.message || 'Error cancelling transaction');
    }
  };

  const handleAddFunds = async (e) => {
    e.preventDefault();
    try {
      const amount = parseFloat(fundAmount);
      if (amount < 1) {
        alert('Amount must be at least $1');
        return;
      }

      const response = await axios.post('/api/transactions/add-funds', { amount });
      updateUserBalance(response.data.balance);
      setFundAmount('');
      alert('Funds added successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding funds');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return '#f39c12';
      case 'IN_ESCROW': return '#3498db';
      case 'COMPLETED': return '#27ae60';
      case 'CANCELLED': return '#e74c3c';
      case 'DISPUTED': return '#9b59b6';
      default: return '#95a5a6';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="user-info">
          <h2>Welcome, {user.username}!</h2>
          <div className="balance">
            Balance: <span className="balance-amount">${user.balance.toFixed(2)}</span>
          </div>
        </div>
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={activeTab === 'overview' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'transactions' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </button>
        <button 
          className={activeTab === 'send' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('send')}
        >
          Send Money
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Transactions</h3>
                <p className="stat-number">{transactions.length}</p>
              </div>
              <div className="stat-card">
                <h3>Pending</h3>
                <p className="stat-number">
                  {transactions.filter(t => t.status === 'PENDING').length}
                </p>
              </div>
              <div className="stat-card">
                <h3>In Escrow</h3>
                <p className="stat-number">
                  {transactions.filter(t => t.status === 'IN_ESCROW').length}
                </p>
              </div>
              <div className="stat-card">
                <h3>Completed</h3>
                <p className="stat-number">
                  {transactions.filter(t => t.status === 'COMPLETED').length}
                </p>
              </div>
            </div>

            <div className="add-funds-section">
              <h3>Add Funds (Demo)</h3>
              <form onSubmit={handleAddFunds} className="add-funds-form">
                <input
                  type="number"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                  step="0.01"
                  required
                />
                <button type="submit" className="add-funds-btn">Add Funds</button>
              </form>
            </div>

            <div className="recent-transactions">
              <h3>Recent Transactions</h3>
              {transactions.slice(0, 5).map(transaction => (
                <div key={transaction._id} className="transaction-item">
                  <div className="transaction-info">
                    <p className="transaction-id">#{transaction.transactionId}</p>
                    <p className="transaction-description">{transaction.description}</p>
                    <p className="transaction-parties">
                      {transaction.sender._id === user.id ? 
                        `To: ${transaction.receiver.username}` : 
                        `From: ${transaction.sender.username}`
                      }
                    </p>
                  </div>
                  <div className="transaction-details">
                    <p className="transaction-amount">${transaction.amount.toFixed(2)}</p>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(transaction.status) }}
                    >
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="transactions-tab">
            <h3>All Transactions</h3>
            {transactions.length === 0 ? (
              <p className="no-transactions">No transactions yet</p>
            ) : (
              <div className="transactions-list">
                {transactions.map(transaction => (
                  <div key={transaction._id} className="transaction-card">
                    <div className="transaction-header">
                      <div className="transaction-id">#{transaction.transactionId}</div>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(transaction.status) }}
                      >
                        {transaction.status}
                      </span>
                    </div>
                    
                    <div className="transaction-body">
                      <p><strong>Description:</strong> {transaction.description}</p>
                      <p><strong>Amount:</strong> ${transaction.amount.toFixed(2)}</p>
                      <p><strong>Commission:</strong> ${transaction.commission.toFixed(2)}</p>
                      <p><strong>Net Amount:</strong> ${transaction.netAmount.toFixed(2)}</p>
                      <p><strong>Sender:</strong> {transaction.sender.username}</p>
                      <p><strong>Receiver:</strong> {transaction.receiver.username}</p>
                      <p><strong>Created:</strong> {formatDate(transaction.createdAt)}</p>
                      {transaction.completedAt && (
                        <p><strong>Completed:</strong> {formatDate(transaction.completedAt)}</p>
                      )}
                    </div>

                    <div className="transaction-actions">
                      {transaction.receiver._id === user.id && 
                       (transaction.status === 'PENDING' || transaction.status === 'IN_ESCROW') && 
                       !transaction.receiverApproved && (
                        <button 
                          onClick={() => handleApproveTransaction(transaction.transactionId)}
                          className="approve-btn"
                        >
                          Approve & Release Funds
                        </button>
                      )}
                      
                      {transaction.sender._id === user.id && 
                       (transaction.status === 'PENDING' || transaction.status === 'IN_ESCROW') && 
                       !transaction.receiverApproved && (
                        <button 
                          onClick={() => handleCancelTransaction(transaction.transactionId)}
                          className="cancel-btn"
                        >
                          Cancel Transaction
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'send' && (
          <div className="send-tab">
            <CreateTransaction onTransactionCreated={fetchTransactions} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
# ESKRO - Escrow Service MVP

## 📋 Project Overview

ESKRO is a comprehensive escrow service web application that facilitates secure financial transactions between parties who don't fully trust each other. The platform acts as a neutral third party, holding funds in escrow until both parties fulfill their obligations, ensuring safe and reliable transactions for buyers and sellers.

## 🎯 Business Problem Solved

In digital marketplaces and peer-to-peer transactions, buyers and sellers face significant risks:
- **Buyers** risk losing money without receiving goods/services
- **Sellers** risk delivering goods/services without payment
- **Both parties** lack a trusted intermediary for dispute resolution

ESKRO solves these problems by providing a secure escrow service that protects both parties and ensures fair transactions.

## 🏗️ System Architecture

### High-Level Architecture
```
Frontend (React.js) ←→ Backend API (Node.js/Express) ←→ Database (MongoDB)
```

### Detailed Project Structure
```
eskro/
├── backend/                    # Server-side application
│   ├── models/                # Database schemas
│   │   ├── User.js           # User account model
│   │   └── Transaction.js    # Escrow transaction model
│   ├── routes/               # API endpoints
│   │   ├── auth.js          # Authentication routes
│   │   └── transactions.js  # Transaction management routes
│   ├── middleware/          # Custom middleware
│   │   └── auth.js         # JWT authentication middleware
│   ├── server.js           # Main server configuration
│   ├── package.json        # Backend dependencies
│   └── .env               # Environment variables
└── frontend/              # Client-side application
    ├── src/
    │   ├── components/    # React components
    │   │   ├── Dashboard.js      # User dashboard
    │   │   ├── Login.js         # Login form
    │   │   ├── Register.js      # Registration form
    │   │   └── CreateTransaction.js # Transaction creation
    │   ├── context/
    │   │   └── AuthContext.js   # Authentication state management
    │   ├── App.js              # Main application component
    │   └── index.js            # Application entry point
    ├── public/                 # Static assets
    └── package.json           # Frontend dependencies
```

## 🔧 Technology Stack

### Backend Technologies
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database for data persistence
- **Mongoose**: MongoDB object modeling library
- **JWT (jsonwebtoken)**: Secure authentication tokens
- **bcryptjs**: Password hashing and encryption
- **CORS**: Cross-origin resource sharing middleware
- **dotenv**: Environment variable management

### Frontend Technologies
- **React.js**: User interface library
- **React Router DOM**: Client-side routing
- **Axios**: HTTP client for API requests
- **Context API**: State management for authentication

### Development Tools
- **Nodemon**: Auto-restart development server
- **Create React App**: React project bootstrapping

## 💡 Key Features & Functionality

### 🔐 Authentication System
- **User Registration**: Secure account creation with password hashing
- **User Login**: JWT-based authentication
- **Protected Routes**: Middleware-based route protection
- **Session Management**: Persistent login state

### 💰 Escrow Transaction Management
- **Transaction Creation**: Users can initiate escrow transactions
- **Fund Holding**: Secure temporary fund storage
- **Status Tracking**: Real-time transaction state monitoring
- **Fund Release**: Automated fund distribution upon completion

### 📊 Dashboard Features
- **Transaction Overview**: View all user transactions
- **Status Monitoring**: Track transaction progress
- **Action Center**: Approve, reject, or manage transactions
- **Transaction History**: Complete transaction audit trail

## 🔄 Transaction Workflow

### Transaction States
1. **PENDING**: 
   - Sender creates transaction and deposits funds
   - Waiting for receiver acknowledgment
   - Funds held in escrow

2. **IN_ESCROW**: 
   - Both parties have confirmed transaction details
   - Funds securely held by platform
   - Awaiting completion conditions

3. **COMPLETED**: 
   - Transaction conditions met
   - Funds released to receiver (minus commission)
   - Transaction marked as successful

4. **DISPUTED** *(Future Enhancement)*: 
   - Issues raised by either party
   - Manual intervention required
   - Dispute resolution process

### Commission Structure
- **Platform Fee**: 3% commission on all transactions
- **Calculation**: Fee = Transaction Amount × 0.03
- **Recipient Amount**: Original Amount - Platform Fee
- **Example**: $100 transaction = $97 to receiver, $3 platform fee

## 🛡️ Security Implementation

### Data Protection
- **Password Security**: bcrypt hashing with salt rounds
- **Token Security**: JWT with expiration and secret keys
- **Input Validation**: Server-side validation for all inputs
- **Environment Security**: Sensitive data in environment variables

### API Security
- **Authentication Middleware**: Protected route access control
- **CORS Configuration**: Controlled cross-origin requests
- **HTTP Headers**: Security headers implementation
- **Error Handling**: Secure error responses without data leakage

## 🚀 Installation & Setup Guide

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation
- Git for version control

### Backend Setup
```bash
# 1. Create project directory
mkdir eskro && cd eskro

# 2. Initialize backend
mkdir backend && cd backend
npm init -y

# 3. Install dependencies
npm install express mongoose bcryptjs jsonwebtoken cors dotenv
npm install -D nodemon

# 4. Update package.json scripts
# Add to scripts section:
# "start": "node server.js"
# "dev": "nodemon server.js"

# 5. Create environment variables file
# Create .env with:
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET=your_secure_jwt_secret
# PORT=5000
```

### Frontend Setup
```bash
# 1. Navigate to project root
cd ../

# 2. Create React application
npx create-react-app frontend
cd frontend

# 3. Install additional dependencies
npm install axios react-router-dom

# 4. Create environment variables
# Create .env with:
# REACT_APP_API_URL=http://localhost:5000
```

### Database Setup
1. Create MongoDB Atlas account
2. Create new cluster
3. Configure network access (IP whitelist)
4. Create database user
5. Get connection string
6. Add connection string to backend/.env

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eskro
JWT_SECRET=your-super-secure-jwt-secret-key-here
PORT=5000
NODE_ENV=development
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### Production Mode
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
# Serve build folder with web server
```

## 📡 API Endpoints

### Authentication Routes
```
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
GET  /api/auth/me         # Get current user (protected)
```

### Transaction Routes
```
GET    /api/transactions           # Get user transactions (protected)
POST   /api/transactions           # Create new transaction (protected)
PUT    /api/transactions/:id       # Update transaction status (protected)
GET    /api/transactions/:id       # Get specific transaction (protected)
```

## 🧪 Testing the Application

### Manual Testing Scenarios
1. **User Registration**: Create new account with valid credentials
2. **User Login**: Authenticate with registered credentials
3. **Create Transaction**: Initiate escrow transaction
4. **Transaction Approval**: Approve transaction as receiver
5. **Fund Release**: Complete transaction and verify fund transfer
6. **Error Handling**: Test invalid inputs and error responses

### Test Data Examples
```javascript
// Sample user registration
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}

// Sample transaction creation
{
  "receiverEmail": "jane@example.com",
  "amount": 100,
  "description": "Website development services"
}
```

## 🚀 Deployment Guide

### Backend Deployment (Render/Heroku)
1. Push code to GitHub repository
2. Connect deployment platform to repository
3. Configure environment variables in platform dashboard
4. Set build and start commands
5. Deploy and test API endpoints

### Frontend Deployment (Vercel/Netlify)
1. Push frontend code to GitHub
2. Connect deployment platform to repository
3. Set build command: `npm run build`
4. Set publish directory: `build`
5. Configure environment variables
6. Deploy and test application

## 🔮 Future Enhancements

### Phase 2 Features
- **Payment Gateway Integration**: Stripe/PayPal integration
- **Dispute Resolution System**: Automated dispute handling
- **Email Notifications**: Transaction status updates
- **Mobile Application**: React Native mobile app

### Phase 3 Features
- **Multi-currency Support**: Support for various currencies
- **KYC Verification**: Identity verification system
- **Advanced Analytics**: Transaction analytics dashboard
- **API Rate Limiting**: Enhanced security measures

## 🐛 Troubleshooting

### Common Issues
1. **Database Connection**: Verify MongoDB URI and network access
2. **CORS Errors**: Check frontend API URL configuration
3. **Authentication Issues**: Verify JWT secret consistency
4. **Port Conflicts**: Ensure ports 3000 and 5000 are available

### Debug Commands
```bash
# Check backend logs
npm run dev

# Check frontend console
# Open browser developer tools > Console tab

# Verify database connection
# Check MongoDB Atlas cluster status
```

## 📚 Learning Outcomes

This project demonstrates proficiency in:
- **Full-stack Development**: Complete MERN stack implementation
- **Database Design**: MongoDB schema design and relationships
- **Authentication**: JWT-based secure authentication
- **API Development**: RESTful API design and implementation
- **State Management**: React Context API usage
- **Security**: Implementation of security best practices
- **Project Structure**: Clean, maintainable code organization

## 🤝 Contributing

For educational purposes, this project follows industry best practices:
- Clean code principles
- Proper error handling
- Security considerations
- Scalable architecture
- Comprehensive documentation

## 📞 Support

For questions or issues related to this educational project:
1. Review the troubleshooting section
2. Check the API endpoint documentation
3. Verify environment variable configuration
4. Test with provided sample data

---

**Note**: This is an educational MVP demonstrating escrow service concepts. For production use, additional security measures, payment gateway integration, and regulatory compliance would be required.

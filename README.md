# Finance Tracker

A comprehensive Node.js backend API for personal finance management, built with Express, PostgreSQL, and Sequelize. Track your income, expenses, investments, and budgets all in one place.

## 🚀 Features

- **User Authentication**: Secure JWT-based authentication system
- **Transaction Management**: Track income and expenses with categories
- **Investment Portfolio**: Manage stocks, crypto, and other investments with real-time price updates
- **Budget Tracking**: Set budget limits and get alerts when exceeded
- **Activity Logging**: Comprehensive audit trail of all user actions
- **Email Notifications**: Budget alerts via email (configurable)
- **Portfolio Analytics**: Calculate profit/loss and portfolio performance

## 🛠️ Technologies

- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL
- **ORM**: Sequelize 6.x
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: Joi
- **Logging**: Winston
- **Email**: Nodemailer
- **Caching**: node-cache
- **HTTP Client**: Axios

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nbeany/finance_tracker.git
   cd finance-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Server
   PORT=5000

   # Database
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=finance_tracker
   DB_PORT=5432

   # JWT
   JWT_SECRET=your_super_secret_jwt_key_here

   # Email (Optional - for budget alerts)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   EMAIL_FROM=Finance Tracker <your_email@gmail.com>

   # Alpha Vantage API (Optional - for stock prices)
   ALPHA_VANTAGE_KEY=your_alpha_vantage_api_key
   ```

4. **Create the database**
   ```sql
   CREATE DATABASE finance_tracker;
   ```

5. **Start the server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

   The server will start on `http://localhost:5000`

## 📁 Project Structure

```
finance-tracker/
├── config/           # Configuration files
│   ├── db.js        # Database connection
│   ├── env.js       # Environment variables
│   └── logger.js    # Winston logger setup
├── controllers/     # Request handlers
│   ├── authController.js
│   ├── userController.js
│   ├── transactionController.js
│   ├── investmentController.js
│   ├── budgetController.js
│   ├── logController.js
│   └── authTokenController.js
├── middlewares/     # Express middlewares
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   ├── rateLimiter.js
│   ├── tokenExtractor.js
│   └── validateRequest.js
├── models/          # Sequelize models
│   ├── userModel.js
│   ├── transactionModel.js
│   ├── investmentModel.js
│   ├── budgetModel.js
│   ├── authTokenModel.js
│   ├── logModel.js
│   └── index.js
├── routes/          # API routes
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── transactionRoutes.js
│   ├── investmentRoutes.js
│   ├── budgetRoutes.js
│   ├── logRoutes.js
│   └── tokenRoutes.js
├── services/        # Business logic services
│   ├── budgetService.js
│   ├── investmentService.js
│   └── emailService.js
├── utils/           # Utility functions
│   ├── apiError.js
│   ├── calculatePortfolio.js
│   ├── generateToken.js
│   └── sendResponse.js
├── tests/           # Test files
├── docs/            # Documentation
├── app.js           # Express app configuration
├── index.js         # Application entry point
└── package.json     # Dependencies
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/logout` - Logout (requires authentication)

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `DELETE /api/users/me` - Delete user account
- `GET /api/users` - Get all users (admin)

### Transactions
- `POST /api/transactions` - Create a new transaction
- `GET /api/transactions` - Get all user transactions
- `PUT /api/transactions/:id` - Update a transaction
- `DELETE /api/transactions/:id` - Delete a transaction

### Investments
- `POST /api/investments` - Add a new investment
- `GET /api/investments` - Get all user investments
- `GET /api/investments/portfolio` - Get portfolio summary with calculations
- `POST /api/investments/update-prices` - Update investment prices from APIs
- `PUT /api/investments/:id` - Update an investment
- `DELETE /api/investments/:id` - Delete an investment

### Budgets
- `POST /api/budgets` - Create a new budget
- `GET /api/budgets` - Get all user budgets
- `GET /api/budgets/check/status` - Check budget status and send alerts
- `PUT /api/budgets/:id` - Update a budget
- `DELETE /api/budgets/:id` - Delete a budget

### Logs
- `GET /api/logs` - Get user activity logs

### Tokens
- `GET /api/tokens` - Get active authentication tokens

For detailed API documentation with request/response examples, see [API_ENDPOINTS.md](./API_ENDPOINTS.md).

## 🔐 Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

To get a token:
1. Register a new user at `POST /api/auth/register`
2. Login at `POST /api/auth/login` to receive your token

## 💡 Usage Examples

### 1. Register and Login
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### 2. Create a Transaction
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "type": "expense",
    "category": "Food",
    "amount": 50.00,
    "description": "Lunch",
    "date": "2024-01-15"
  }'
```

### 3. Add an Investment
```bash
curl -X POST http://localhost:5000/api/investments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "asset_type": "crypto",
    "symbol": "bitcoin",
    "quantity": 0.5,
    "buy_price": 40000,
    "current_price": 45000
  }'
```

### 4. Get Portfolio Summary
```bash
curl -X GET http://localhost:5000/api/investments/portfolio \
  -H "Authorization: Bearer <your_token>"
```

## 🧪 Testing

Run tests with:
```bash
npm test
```

## 🔄 Database Migrations

The application uses Sequelize's `sync({ alter: true })` for automatic schema synchronization. In production, consider using proper migrations.

## 📊 Investment Price Updates

The investment service supports fetching real-time prices:
- **Crypto**: Uses CoinGecko API (no API key required)
- **Stocks**: Uses Alpha Vantage API (requires API key)
- Prices are cached for 30 seconds to reduce API calls

To update all investment prices:
```bash
POST /api/investments/update-prices
```

## 📧 Email Notifications

Budget alerts are sent via email when a budget is exceeded. Configure email settings in `.env`:
- `EMAIL_HOST`: SMTP server host
- `EMAIL_PORT`: SMTP port (usually 587)
- `EMAIL_USER`: Your email address
- `EMAIL_PASS`: Your email password or app password

## 🛡️ Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting (100 requests per minute per IP)
- Input validation with Joi
- SQL injection protection via Sequelize ORM
- CORS enabled for cross-origin requests

## 📝 Logging

The application uses Winston for logging:
- Console logging for development
- File logging to `logs/app.log`
- Error logging to `logs/error.log`

## 🐛 Error Handling

The API uses a centralized error handling middleware that:
- Returns appropriate HTTP status codes
- Provides meaningful error messages
- Logs errors for debugging
- Handles Sequelize validation errors

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🐛 Issues

If you encounter any issues, please file them on the [GitHub Issues page](https://github.com/nbeany/finance_tracker/issues).

## 📞 Support

For questions or support, please open an issue on GitHub.

## 🎯 Roadmap

- [ ] Add more investment types (bonds, mutual funds)
- [ ] Implement recurring transactions
- [ ] Add data export functionality
- [ ] Create admin dashboard
- [ ] Add more analytics and reports
- [ ] Implement multi-currency support

---

**Built with ❤️ for better financial management**

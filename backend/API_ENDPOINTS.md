# Finance Tracker API - Testing Endpoints

## Base URL
```
http://localhost:5000/api
```

## Authentication Endpoints

### 1. Register User
**POST** `/api/auth/register`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### 2. Login
**POST** `/api/auth/login`
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
**Response:** Returns JWT token
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Logout
**POST** `/api/auth/logout`
**Headers:** `Authorization: Bearer <token>`

---

## User Endpoints

### 4. Get Profile
**GET** `/api/users/me`
**Headers:** `Authorization: Bearer <token>`

### 5. Update Profile
**PUT** `/api/users/me`
**Headers:** `Authorization: Bearer <token>`
```json
{
  "name": "John Updated"
}
```

### 6. Delete Account
**DELETE** `/api/users/me`
**Headers:** `Authorization: Bearer <token>`

### 7. Get All Users (Admin)
**GET** `/api/users`
**Headers:** `Authorization: Bearer <token>`

---

## Transaction Endpoints

### 8. Create Transaction
**POST** `/api/transactions`
**Headers:** `Authorization: Bearer <token>`
```json
{
  "type": "expense",
  "category": "Food",
  "amount": 50.00,
  "description": "Lunch",
  "date": "2024-01-15"
}
```

### 9. Get User Transactions
**GET** `/api/transactions`
**Headers:** `Authorization: Bearer <token>`

### 10. Update Transaction
**PUT** `/api/transactions/:id`
**Headers:** `Authorization: Bearer <token>`
```json
{
  "amount": 60.00,
  "description": "Updated lunch"
}
```

### 11. Delete Transaction
**DELETE** `/api/transactions/:id`
**Headers:** `Authorization: Bearer <token>`

---

## Investment Endpoints

### 12. Add Investment
**POST** `/api/investments`
**Headers:** `Authorization: Bearer <token>`
```json
{
  "asset_type": "stock",
  "symbol": "AAPL",
  "quantity": 10,
  "buy_price": 150.00,
  "current_price": 155.00,
  "exchange": "NASDAQ"
}
```

### 13. Get Investments
**GET** `/api/investments`
**Headers:** `Authorization: Bearer <token>`

### 14. Update Investment
**PUT** `/api/investments/:id`
**Headers:** `Authorization: Bearer <token>`
```json
{
  "current_price": 160.00
}
```

### 15. Delete Investment
**DELETE** `/api/investments/:id`
**Headers:** `Authorization: Bearer <token>`

---

## Budget Endpoints

### 16. Create Budget
**POST** `/api/budgets`
**Headers:** `Authorization: Bearer <token>`
```json
{
  "category": "Food",
  "limit_amount": 500.00
}
```

### 17. Get Budgets
**GET** `/api/budgets`
**Headers:** `Authorization: Bearer <token>`

### 18. Update Budget
**PUT** `/api/budgets/:id`
**Headers:** `Authorization: Bearer <token>`
```json
{
  "limit_amount": 600.00
}
```

### 19. Delete Budget
**DELETE** `/api/budgets/:id`
**Headers:** `Authorization: Bearer <token>`

### 20. Check Budget Status
**GET** `/api/budgets/check/status`
**Headers:** `Authorization: Bearer <token>`

---

## Log Endpoints

### 21. Get Logs
**GET** `/api/logs`
**Headers:** `Authorization: Bearer <token>`

---

## Token Endpoints

### 22. Get Active Tokens
**GET** `/api/tokens`
**Headers:** `Authorization: Bearer <token>`

---

## Quick Test Sequence

1. **Register a new user:**
   ```bash
   POST http://localhost:5000/api/auth/register
   Body: {"name": "Test User", "email": "test@example.com", "password": "test123"}
   ```

2. **Login to get token:**
   ```bash
   POST http://localhost:5000/api/auth/login
   Body: {"email": "test@example.com", "password": "test123"}
   ```

3. **Get profile (use token from step 2):**
   ```bash
   GET http://localhost:5000/api/users/me
   Headers: Authorization: Bearer <your-token>
   ```

4. **Create a transaction:**
   ```bash
   POST http://localhost:5000/api/transactions
   Headers: Authorization: Bearer <your-token>
   Body: {"type": "expense", "category": "Food", "amount": 25.50, "description": "Dinner", "date": "2024-01-15"}
   ```

---

## Environment Variables Required

Create a `.env` file with:
```
PORT=5000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=finance_tracker
DB_PORT=5432
JWT_SECRET=your_secret_key_here
```


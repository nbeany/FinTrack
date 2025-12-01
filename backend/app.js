const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const logger = require("./config/logger");
const errorMiddleware = require("./middlewares/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const investmentRoutes = require("./routes/investmentRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const logRoutes = require("./routes/logRoutes");
const tokenRoutes = require("./routes/tokenRoutes");
const app = express();

//  Middlewares
app.use(express.json());
// CORS configuration - allow frontend origin
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan("dev"));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/investments", investmentRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/tokens", tokenRoutes);

//  Error Handler
app.use(errorMiddleware);

module.exports = app;

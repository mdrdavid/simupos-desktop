import "reflect-metadata";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { AppDataSource } from "./config/database";
import { errorHandler } from "./middlewares/errorHandler";
import {
  authRoutes,
  branchRoutes,
  itemRoutes,
  saleRoutes,
  expenseRoutes,
  userRoutes,
  reportRoutes,
  subscriptionRoutes,
  syncRoutes,
  businessRoutes,
  transactionRoutes,
  customerRoutes,
  creditRoutes,
  agroTransactionRoutes,
  profitRoutes,
  weldingMaterialStockRoutes,
  weldingJobRoutes,
  weldingQuoteRoutes,
  weldingInvoiceRoutes,
  salesMetricsRoutes,
  agroProductRoutes,
  dashboardRoutes,
  transactionAnalysisRoutes,
  cashRegisterRoutes,
  vatRoutes,
  adminRoutes,
} from "./routes";

const app = express();
const PORT = process.env.PORT || 7000;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// General middleware
app.use(compression());
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/branches", branchRoutes);
app.use("/api/v1/items", itemRoutes);
app.use("/api/v1/sales", saleRoutes);
app.use("/api/v1/expenses", expenseRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/subscriptions", subscriptionRoutes);
app.use("/api/v1/businesses", businessRoutes);
app.use("/api/v1/transactions", transactionRoutes);
app.use("/api/v1/customers", customerRoutes);
app.use("/api/v1/credits", creditRoutes);
app.use("/api/v1/profit", profitRoutes);
app.use("/api/v1/agro", agroProductRoutes);
app.use("/api/v1/agro-transactions", agroTransactionRoutes);
app.use("/api/v1/sync", syncRoutes);
app.use("/api/v1/welding/materials", weldingMaterialStockRoutes);
app.use("/api/v1/welding/jobs", weldingJobRoutes);
app.use("/api/v1/welding/quotes", weldingQuoteRoutes);
app.use("/api/v1/welding/invoices", weldingInvoiceRoutes);
app.use("/api/v1/sales", salesMetricsRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/", transactionAnalysisRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/cash-register", cashRegisterRoutes);
app.use("/api/v1/vat", vatRoutes);
// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

export default app;

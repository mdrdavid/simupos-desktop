import { DataSource } from "typeorm";
import path from "path";
import { User } from "../models/User";
import { Branch } from "../models/Branch";
import { Item } from "../models/Item";
import { Sale } from "../models/Sale";
import { SaleItem } from "../models/SaleItem";
import { Expense } from "../models/Expense";
import { StockMovement } from "../models/StockMovement";
import { Subscription } from "../models/Subscription";
import { SyncLog } from "../models/SyncLog";
import { Business } from "../models/Business";
import { SubscriptionPlan } from "../models/SubscriptionPlan";
import { Report } from "../models/Reports";
import { TransactionItem } from "../models/TransactionItem";
import { Transaction } from "../models/Transaction";
import { Customer } from "../models/Customer";
import { CreditEntry } from "../models/CreditEntry";
import { CreditPayment } from "../models/CreditPayment";
import { AgroProduct } from "../models/AgroProduct";
import { StockShipment } from "../models/StockShipment";
import { AgroProductSaleItem } from "../models/AgroProductSaleItem";
import { AgroSale } from "../models/AgroSale";
import { AgroCustomerDetails } from "../models/AgroCustomerDetails";
import { WeldingJob } from "../models/WeldingJob";
import { WeldingMaterialNeeded } from "../models/WeldingMaterialNeeded";
import { WeldingMaterialStock } from "../models/WeldingMaterialStock";
import { WeldingJobExpense } from "../models/WeldingJobExpense";
import { WeldingJobImage } from "../models/WeldingJobImage";
import { WeldingQuote } from "../models/WeldingQuote";
import { WeldingInvoice } from "../models/WeldingInvoice";
import { WeldingQuoteLineItem } from "../models/WeldingQuoteLineItem";
import { WeldingInvoiceLineItem } from "../models/WeldingInvoiceLineItem";
import { WeldingInvoicePayment } from "../models/WeldingInvoicePayment";
import { AgroProductVariant } from "../models/AgroProductVariant";
import { CashRegisterLog } from "../models/CashRegisterLog";
import { CashRegisterSession } from "../models/CashRegisterSession";

// Use absolute path that works in both development and production
const getDatabasePath = () => {
  if (process.env.NODE_ENV === "production") {
    return path.join(process.cwd(), "db", "simpos.sqlite");
  } else {
    return path.join(__dirname, "..", "db", "simpos.sqlite");
  }
};

const databasePath = getDatabasePath();

console.log("Database path:", databasePath);
console.log("NODE_ENV:", process.env.NODE_ENV);

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: databasePath,
  synchronize: true, // This will create tables
  logging: true,
  entities: [
    User,
    Branch,
    Item,
    Sale,
    SaleItem,
    Expense,
    StockMovement,
    Subscription,
    SyncLog,
    Business,
    SubscriptionPlan,
    Report,
    TransactionItem,
    Transaction,
    Customer,
    CreditEntry,
    CreditPayment,
    AgroProduct,
    StockShipment,
    AgroProductSaleItem,
    AgroSale,
    AgroCustomerDetails,
    WeldingJob,
    WeldingMaterialNeeded,
    WeldingMaterialStock,
    WeldingJobExpense,
    WeldingJobImage,
    WeldingQuote,
    WeldingInvoice,
    WeldingQuoteLineItem,
    WeldingInvoiceLineItem,
    WeldingInvoicePayment,
    AgroProductVariant,
    CashRegisterLog,
    CashRegisterSession,
  ],
  //  migrations temporarily
  migrations: ["src/migrations/*.js"],
  subscribers: [],
  enableWAL: true,
});

// import { DataSource } from "typeorm";
// import {
//   User,
//   Branch,
//   Item,
//   Sale,
//   SaleItem,
//   Expense,
//   StockMovement,
//   Subscription,
//   SyncLog,
//   Business,
//   SubscriptionPlan,
//   Report,
//   TransactionItem,
//   Transaction,
//   Customer,
//   CreditEntry,
//   CreditPayment,
//   AgroProduct,
//   StockShipment,
//   AgroProductSaleItem,
//   AgroSale,
//   AgroCustomerDetails,
//   WeldingJob,
//   WeldingMaterialNeeded,
//   WeldingMaterialStock,
//   WeldingJobExpense,
//   WeldingJobImage,
//   WeldingQuote,
//   WeldingInvoice,
//   WeldingQuoteLineItem,
//   WeldingInvoiceLineItem,
//   WeldingInvoicePayment,
//   AgroProductVariant,
//   CashRegisterLog,
//   CashRegisterSession,
// } from "../models";
// export const AppDataSource = new DataSource({
//   type: "sqlite",
//   database: "db/simpos.sqlite",
//   //  synchronize: process.env.NODE_ENV !== 'production', // Only sync in development
//   logging: true, // Set to true to see SQL queries
//   entities: [
//     User,
//     Branch,
//     Item,
//     Sale,
//     SaleItem,
//     Expense,
//     StockMovement,
//     Subscription,
//     SyncLog,
//     Business,
//     Report,
//     SubscriptionPlan,
//     TransactionItem,
//     Transaction,
//     Customer,
//     CreditEntry,
//     CreditPayment,
//     AgroProduct,
//     StockShipment,
//     AgroProductSaleItem,
//     AgroSale,
//     AgroCustomerDetails,
//     WeldingJob,
//     WeldingMaterialNeeded,
//     WeldingMaterialStock,
//     WeldingJobExpense,
//     WeldingJobImage,
//     WeldingQuote,
//     WeldingInvoice,
//     WeldingQuoteLineItem,
//     WeldingInvoiceLineItem,
//     WeldingInvoicePayment,
//     AgroProductVariant,
//     CashRegisterLog,
//     CashRegisterSession,
//   ],
//   // migrations: ["src/migrations/*.ts"],
//   subscribers: [],
// });

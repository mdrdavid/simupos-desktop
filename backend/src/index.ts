import dotenv from "dotenv";
import app from "./app";
import { AppDataSource } from "./config/database";
import { Logger } from "./logger";
import { InitializationService } from "./services";

dotenv.config();

async function waitForTables() {
  // Wait a bit for tables to be created by synchronize
  return new Promise((resolve) => setTimeout(resolve, 2000));
}

async function initializeApp() {
  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      Logger.info("Database connection initialized.");
    }

    // Wait for tables to be created
    await waitForTables();

    // Initialize database with default data
    const initializationService = new InitializationService();
    await initializationService.initializeDatabase();

    const port = process.env.PORT || 7000;

    // Start the Server
    app.listen(port, () => {
      Logger.info(`Environment set to "${process.env.NODE_ENV}".`);
      Logger.info(`Server running on http://localhost:${port}.`);
    });
  } catch (error) {
    Logger.error("Error during Data Source initialization", error);
    process.exit(1);
  }
}

initializeApp();

import dotenv from "dotenv";
import app from "./app";
import { AppDataSource } from "./config/database";
import { Logger } from "./logger";
import { InitializationService } from "./services";

dotenv.config();
AppDataSource.initialize()
  .then(async () => {
    Logger.info("Database connection initialized.");
    // Initialize database with default data
    const initializationService = new InitializationService();
    await initializationService.initializeDatabase();

    const port = process.env.PORT || 7000;

    // Start the Server
    app.listen(port, () => {
      Logger.info(`Environment set to "${process.env.NODE_ENV}".`);
      Logger.info(`Server running on http://localhost:${port}.`);
    });
  })
  .catch((error) => {
    Logger.error("Error during Data Source initialization", error);
  });

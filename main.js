const { app, BrowserWindow } = require("electron");
const path = require("path");
const { fork } = require("child_process");
const fs = require("fs");

let mainWindow;
let backendProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadURL("http://localhost:3000");
  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

function ensureDatabaseClean() {
  // Clean BOTH possible database locations
  const dbPaths = [
    path.join(__dirname, "backend", "db", "simpos.sqlite"), // Development path
    path.join(process.cwd(), "db", "simpos.sqlite"), // Production path
  ];

  dbPaths.forEach((dbPath) => {
    const dbDir = path.dirname(dbPath);

    // Ensure db directory exists
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log("✓ Created database directory:", dbDir);
    }

    // Delete existing database file to start fresh
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log("✓ Deleted existing database file:", dbPath);
    }
  });
}

function startBackend() {
  const backendPath = path.join(__dirname, "backend", "dist", "index.js");

  console.log("Starting backend from:", backendPath);

  // Set environment variables
  const env = {
    ...process.env,
    NODE_ENV: "production",
    // Force synchronization for first run
    DB_SYNC: "true",
  };

  backendProcess = fork(backendPath, [], {
    env,
    stdio: ["inherit", "inherit", "inherit", "ipc"],
  });

  backendProcess.on("message", (message) => {
    console.log("Backend:", message);
  });

  backendProcess.on("error", (error) => {
    console.error("Backend process error:", error);
  });

  backendProcess.on("exit", (code, signal) => {
    console.log(
      `Backend process exited with code ${code} and signal ${signal}`
    );
    if (code !== 0) {
      console.log(
        "Backend failed to start properly. Check database configuration."
      );
    }
  });

  return backendProcess;
}

function startFrontend() {
  console.log("Starting frontend...");
  const frontendProcess = require("child_process").spawn(
    "npm",
    ["run", "dev"],
    {
      cwd: path.join(__dirname, "frontend"),
      stdio: "inherit",
      shell: true,
    }
  );

  return frontendProcess;
}

app.on("ready", async () => {
  console.log("Electron app ready - Starting initialization...");

  // Step 1: Clean database from ALL possible locations
  console.log("Step 1: Cleaning database files...");
  ensureDatabaseClean();

  // Step 2: Build backend
  console.log("Step 2: Building backend...");
  await new Promise((resolve, reject) => {
    const { exec } = require("child_process");
    exec("cd backend && npm run build", (err, stdout, stderr) => {
      if (err) {
        console.error("Failed to build backend:", stderr);
        reject(err);
        return;
      }
      console.log("✓ Backend built successfully");
      resolve();
    });
  });

  // Step 3: Start backend
  console.log("Step 3: Starting backend server...");
  startBackend();

  // Step 4: Wait MUCH longer for backend to initialize database and create tables
  console.log("Step 4: Waiting for database initialization...");
  await new Promise((resolve) => setTimeout(resolve, 15000)); // 15 seconds

  // Step 5: Start frontend
  console.log("Step 5: Starting frontend...");
  startFrontend();

  // Step 6: Create window
  setTimeout(() => {
    console.log("Step 6: Creating Electron window...");
    createWindow();
    console.log("✓ Application started successfully!");
  }, 5000);
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("will-quit", () => {
  console.log("Quitting application...");
  if (backendProcess) {
    backendProcess.kill();
  }
});

app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});

// const { app, BrowserWindow } = require("electron");
// const path = require("path");
// const { fork } = require("child_process");

// let mainWindow;
// let backendProcess;
// let frontendProcess;

// function createWindow() {
//   mainWindow = new BrowserWindow({
//     width: 1200,
//     height: 800,
//     webPreferences: {
//       nodeIntegration: true,
//       contextIsolation: false,
//     },
//   });

//   mainWindow.loadURL("http://localhost:3000");

//   mainWindow.on("closed", function () {
//     mainWindow = null;
//   });
// }

// function startBackend() {
//   const backendPath = path.join(__dirname, "backend/dist/index.js");
//   backendProcess = fork(backendPath);
// }

// function startFrontend() {
//     const frontendPath = path.join(__dirname, "frontend/node_modules/next/dist/bin/next");
//     frontendProcess = fork(frontendPath, ["start"], {
//         cwd: path.join(__dirname, "frontend"),
//     });
// }

// app.on("ready", () => {
//   const { exec } = require("child_process");
//   exec("npm run build --prefix frontend && npm run build --prefix backend", (err, stdout, stderr) => {
//     if (err) {
//       console.error("Failed to build projects:", stderr);
//       app.quit();
//       return;
//     }
//     console.log("Projects built successfully:", stdout);

//     startBackend();
//     startFrontend();

//     // Give servers time to start
//     setTimeout(createWindow, 5000);
//   });
// });

// app.on("window-all-closed", function () {
//   if (process.platform !== "darwin") {
//     app.quit();
//   }
// });

// app.on("will-quit", () => {
//   if (backendProcess) {
//     backendProcess.kill();
//   }
//   if (frontendProcess) {
//     frontendProcess.kill();
//   }
// });

// app.on("activate", function () {
//   if (mainWindow === null) {
//     createWindow();
//   }
// });

const { app, BrowserWindow } = require("electron");
const path = require("path");
const { fork } = require("child_process");

let mainWindow;
let backendProcess;
let frontendProcess;

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

function startBackend() {
  const backendPath = path.join(__dirname, "backend/dist/index.js");
  backendProcess = fork(backendPath);
}

function startFrontend() {
    const frontendPath = path.join(__dirname, "frontend/node_modules/next/dist/bin/next");
    frontendProcess = fork(frontendPath, ["start"], {
        cwd: path.join(__dirname, "frontend"),
    });
}

app.on("ready", () => {
  const { exec } = require("child_process");
  exec("npm run build --prefix frontend && npm run build --prefix backend", (err, stdout, stderr) => {
    if (err) {
      console.error("Failed to build projects:", stderr);
      app.quit();
      return;
    }
    console.log("Projects built successfully:", stdout);

    startBackend();
    startFrontend();

    // Give servers time to start
    setTimeout(createWindow, 5000);
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("will-quit", () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  if (frontendProcess) {
    frontendProcess.kill();
  }
});

app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});

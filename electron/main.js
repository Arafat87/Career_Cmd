const { app, BrowserWindow, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const http = require("http");

const PORT = 3456;
const isDev = !app.isPackaged;

let mainWindow = null;
let serverProcess = null;

function waitForServer(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      http
        .get(url, (res) => {
          if (res.statusCode === 200) {
            resolve();
          } else {
            retry();
          }
        })
        .on("error", retry);
    };
    const retry = () => {
      if (Date.now() - start > timeout) {
        reject(new Error("Server did not start in time"));
      } else {
        setTimeout(check, 500);
      }
    };
    check();
  });
}

function startServer() {
  if (isDev) {
    // Dev: expect external `npm run dev` or `electron:dev` running
    return Promise.resolve();
  }

  // Production: spawn the standalone Next.js server from extraResources
  // extraResources with "to": "." places files directly in resources/
  const resourcesDir = process.resourcesPath;
  const standaloneDir = path.join(resourcesDir, ".next", "standalone");
  const serverScript = path.join(standaloneDir, "server.js");

  // Load .env.local from resources
  const envFile = path.join(resourcesDir, ".env.local");
  const envVars = { ...process.env, PORT: String(PORT), HOSTNAME: "127.0.0.1", NODE_ENV: "production", NEXTAUTH_URL: `http://localhost:${PORT}` };
  if (fs.existsSync(envFile)) {
    const lines = fs.readFileSync(envFile, "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq > 0) {
        const key = trimmed.slice(0, eq).trim();
        const val = trimmed.slice(eq + 1).trim();
        envVars[key] = val;
      }
    }
  }

  serverProcess = spawn(process.execPath, [serverScript], {
    cwd: standaloneDir,
    env: envVars,
    stdio: ["ignore", "pipe", "pipe"],
  });

  serverProcess.stdout.on("data", (data) => {
    console.log(`[next-server] ${data}`);
  });
  serverProcess.stderr.on("data", (data) => {
    console.error(`[next-server] ${data}`);
  });

  return waitForServer(`http://127.0.0.1:${PORT}`);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: "CareerCMD",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const url = isDev
    ? `http://localhost:${process.env.DEV_PORT || 3333}`
    : `http://127.0.0.1:${PORT}`;

  mainWindow.loadURL(url);

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http")) shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  try {
    await startServer();
    createWindow();
  } catch (err) {
    console.error("Failed to start:", err);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
  app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});

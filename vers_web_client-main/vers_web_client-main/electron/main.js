const { app, BrowserWindow, shell } = require("electron");
const fs = require("fs");
const http = require("http");
const path = require("path");
const handler = require("serve-handler");

const DEV_URL = process.env.ELECTRON_START_URL || "http://localhost:3000";
const PROD_REMOTE_URL = process.env.DESKTOP_APP_URL || "https://car.vkrepo.in";

let staticServer = null;

const createStaticServer = (publicPath) => {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      return handler(req, res, {
        public: publicPath,
        cleanUrls: true,
        rewrites: [{ source: "**", destination: "/index.html" }],
      });
    });

    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
};

const getAppUrl = async () => {
  if (!app.isPackaged) {
    return DEV_URL;
  }

  const buildPath = path.join(__dirname, "..", "build");
  const buildIndexPath = path.join(buildPath, "index.html");

  if (fs.existsSync(buildIndexPath)) {
    staticServer = await createStaticServer(buildPath);
    const { port } = staticServer.address();
    return `http://127.0.0.1:${port}`;
  }

  return PROD_REMOTE_URL;
};

const createWindow = async () => {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: "#eef4ff",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  const appUrl = await getAppUrl();
  await mainWindow.loadURL(appUrl);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
};

app.whenReady().then(async () => {
  await createWindow();

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (staticServer) {
    staticServer.close();
    staticServer = null;
  }
});

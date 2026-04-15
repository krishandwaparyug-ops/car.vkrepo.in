const { app, BrowserWindow, shell } = require("electron");
const fs = require("fs");
const http = require("http");
const path = require("path");
const serveHandler = require("serve-handler");

const DEV_URL = process.env.ELECTRON_START_URL || "http://localhost:3000";
const PROD_REMOTE_URL = process.env.DESKTOP_APP_URL || "https://car.vkrepo.in";

let mainWindow = null;
let localBuildServer = null;
let localBuildUrl = "";

const getLocalBuildPath = () => path.join(app.getAppPath(), "build");

const stopLocalBuildServer = () => {
  if (localBuildServer) {
    localBuildServer.close();
    localBuildServer = null;
    localBuildUrl = "";
  }
};

const startLocalBuildServer = async () => {
  if (localBuildUrl) {
    return localBuildUrl;
  }

  const localBuildPath = getLocalBuildPath();
  const indexFile = path.join(localBuildPath, "index.html");

  if (!fs.existsSync(indexFile)) {
    return "";
  }

  const serverUrl = await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      serveHandler(req, res, {
        public: localBuildPath,
        cleanUrls: false,
        trailingSlash: false,
        directoryListing: false,
      });
    });

    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = address && typeof address === "object" ? address.port : 0;
      if (!port) {
        server.close();
        reject(new Error("Unable to allocate local build server port"));
        return;
      }

      localBuildServer = server;
      resolve(`http://127.0.0.1:${port}`);
    });
  });

  localBuildUrl = serverUrl;
  return serverUrl;
};

const createErrorPage = (targetUrl, message) => {
  const safeUrl = (targetUrl || "").toString();
  const safeMessage = (message || "Unable to open app").toString();
  return `data:text/html;charset=UTF-8,${encodeURIComponent(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>VK Enterprises Software</title>
        <style>
          body { font-family: Segoe UI, Arial, sans-serif; background: #eef4ff; color: #123; margin: 0; }
          .wrap { max-width: 720px; margin: 48px auto; background: #fff; border: 1px solid #d7e4fb; border-radius: 12px; padding: 24px; }
          h1 { margin: 0 0 12px; color: #1f3d66; }
          p { margin: 8px 0; line-height: 1.5; }
          code { background: #f4f7fe; padding: 2px 6px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <h1>VK Enterprises Software</h1>
          <p>The app window opened, but loading failed.</p>
          <p><b>Reason:</b> ${safeMessage}</p>
          <p><b>Target:</b> <code>${safeUrl}</code></p>
          <p>Please check internet connectivity and try again.</p>
        </div>
      </body>
    </html>
  `)}`;
};

const getAppUrl = async () => {
  if (!app.isPackaged) {
    return DEV_URL;
  }

  try {
    const localUrl = await startLocalBuildServer();
    if (localUrl) {
      return `${localUrl}/index.html`;
    }
  } catch (_error) {
    // Fall back to remote URL when local build server cannot start.
  }

  return PROD_REMOTE_URL;
};

const createWindow = async () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.show();
    mainWindow.focus();
    return;
  }

  const isDesktopProduction = app.isPackaged;

  mainWindow = new BrowserWindow({
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
      webSecurity: !isDesktopProduction ? true : false,
      allowRunningInsecureContent: isDesktopProduction,
    },
  });

  let appUrl = await getAppUrl();
  const showFallbackTimer = setTimeout(() => {
    if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.isVisible()) {
      mainWindow.show();
    }
  }, 4000);

  mainWindow.webContents.on(
    "did-fail-load",
    async (_event, errorCode, errorDescription, validatedURL) => {
      if (!mainWindow || mainWindow.isDestroyed()) return;

      const loadError = `${errorCode}: ${errorDescription || "Load failed"}`;
      await mainWindow.loadURL(createErrorPage(validatedURL || appUrl, loadError));
      if (!mainWindow.isVisible()) {
        mainWindow.show();
      }
    }
  );

  try {
    await mainWindow.loadURL(appUrl);
  } catch (error) {
    if (appUrl !== PROD_REMOTE_URL) {
      try {
        appUrl = PROD_REMOTE_URL;
        await mainWindow.loadURL(appUrl);
      } catch (remoteError) {
        await mainWindow.loadURL(
          createErrorPage(appUrl, remoteError?.message || "Load failed")
        );
      }
    } else {
      await mainWindow.loadURL(createErrorPage(appUrl, error?.message || "Load failed"));
    }
  }

  mainWindow.once("ready-to-show", () => {
    clearTimeout(showFallbackTimer);
    mainWindow.show();
  });

  mainWindow.on("closed", () => {
    clearTimeout(showFallbackTimer);
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
};

const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    await createWindow();

    app.on("activate", async () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        await createWindow();
      }
    });
  });
}

app.on("window-all-closed", () => {
  stopLocalBuildServer();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  stopLocalBuildServer();
});

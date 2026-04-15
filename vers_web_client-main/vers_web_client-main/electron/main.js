const { app, BrowserWindow, shell } = require("electron");
const path = require("path");

const DEV_URL = process.env.ELECTRON_START_URL || "http://localhost:3000";
const PROD_REMOTE_URL = process.env.DESKTOP_APP_URL || "https://car.vkrepo.in";

let mainWindow = null;

const createErrorPage = (targetUrl, message) => {
  const safeUrl = (targetUrl || "").toString();
  const safeMessage = (message || "Unable to open app").toString();
  return `data:text/html;charset=UTF-8,${encodeURIComponent(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>VK Repo Car</title>
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
          <h1>VK Repo Car</h1>
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

  const appUrl = await getAppUrl();
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
    await mainWindow.loadURL(createErrorPage(appUrl, error?.message || "Load failed"));
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
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
});

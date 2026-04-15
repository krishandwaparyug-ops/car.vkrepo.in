const { app, BrowserWindow, shell } = require("electron");
const path = require("path");

const DEV_URL = process.env.ELECTRON_START_URL || "http://localhost:3000";
const PROD_REMOTE_URL = process.env.DESKTOP_APP_URL || "https://car.vkrepo.in";

const getAppUrl = async () => {
  if (!app.isPackaged) {
    return DEV_URL;
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
});

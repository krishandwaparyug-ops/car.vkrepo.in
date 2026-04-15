const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("desktopRuntime", {
  isDesktopApp: true,
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  },
});

const isDevelopment = process.env.NODE_ENV === "development";

const appConfig = {
    apiPrefix: isDevelopment
        ? 'http://localhost:5002/api/'
        : 'https://api.vkrepo.in/api/',
    webhookPrefix: 'https://webhooks.vkrepo.in/webhooks/',
    desktopDownloadUrl: process.env.REACT_APP_WINDOWS_DESKTOP_DOWNLOAD_URL || 'https://car.vkrepo.in/downloads/VKRepoCarSetup-0.1.0.exe',
    authenticatedEntryPath: '/dashboard',
    unAuthenticatedEntryPath: '/sign-in',
}

export default appConfig

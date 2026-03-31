const isDevelopment = process.env.NODE_ENV === "development";

const appConfig = {
    apiPrefix: isDevelopment
        ? 'http://localhost:5002/api/'
        : 'https://stingray-app-4e5cp.ondigitalocean.app/api/',
    webhookPrefix: 'https://webhooks.vkrepo.in/webhooks/',
    authenticatedEntryPath: '/dashboard',
    unAuthenticatedEntryPath: '/sign-in',
}

export default appConfig

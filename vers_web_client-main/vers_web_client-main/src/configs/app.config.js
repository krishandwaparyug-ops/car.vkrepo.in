const isDevelopment = process.env.NODE_ENV === "development";

const appConfig = {
    apiPrefix: isDevelopment
        ? 'http://localhost:5002/api/'
        : 'https://api.vkrepo.in/api/',
    webhookPrefix: 'https://webhooks.vkrepo.in/webhooks/',
    authenticatedEntryPath: '/dashboard',
    unAuthenticatedEntryPath: '/sign-in',
}

export default appConfig

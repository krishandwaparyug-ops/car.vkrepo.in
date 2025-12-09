import authRoute from './authRoute'
import pageRoute from './pagesRoute'

export const publicRoutes = [...authRoute]

export const protectedRoutes = [
    ...pageRoute,
]

import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import appConfig from '../../configs/app.config'
import useAuth from '../../utils/hooks/useAuth'
import { REDIRECT_URL_KEY } from '../../constants/app.constant'
const { unAuthenticatedEntryPath } = appConfig

const ProtectedRoute = () => {
    const { authenticated } = useAuth()
    // const authenticated=true   //todo
    const location = useLocation()

    if (!authenticated) {
        return (
            <Navigate
                to={`${unAuthenticatedEntryPath}?${REDIRECT_URL_KEY}=${location.pathname}`}
                replace
            />
        )
    }

    return <Outlet />
}

export default ProtectedRoute

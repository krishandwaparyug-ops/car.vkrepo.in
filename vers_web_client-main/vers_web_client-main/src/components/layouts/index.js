import React, { memo, useMemo, lazy, Suspense } from 'react'
import useAuth from '../../utils/hooks/useAuth'
import useOnlineStatus from '../../utils/hooks/useOnline'

const Layout = () => {
    const { authenticated } = useAuth()
    const isOnline = useOnlineStatus()

    const AppLayout = useMemo(() => {
        // if(!isOnline){
        //     return lazy(() => import('./OfflineLayout'))
        // }
        if (authenticated) {
            return lazy(() => import('./SimpleLayout'))
        }
        return lazy(() => import('./AuthLayout'))
    }, [authenticated, isOnline])

    return (
        <Suspense
            fallback={
                <div className="flex flex-auto flex-col h-[100vh]">
                   loading,,,
                </div>
            }
        >
            <AppLayout />
        </Suspense>
    )
}

export default memo(Layout)

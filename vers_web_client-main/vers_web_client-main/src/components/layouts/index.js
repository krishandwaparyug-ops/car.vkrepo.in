import React, { memo, useMemo, lazy, Suspense } from 'react'
import useAuth from '../../utils/hooks/useAuth'
import ThreeDotLoader from '../template/ThreeDotLoader'

const Layout = () => {
    const { authenticated } = useAuth()

    const AppLayout = useMemo(() => {
        if (authenticated) {
            return lazy(() => import('./SimpleLayout'))
        }
        return lazy(() => import('./AuthLayout'))
    }, [authenticated])

    return (
        <Suspense
            fallback={
                <div className="vk-loader-screen">
                    <ThreeDotLoader label="Loading VK Enterprises Software" />
                </div>
            }
        >
            <AppLayout />
        </Suspense>
    )
}

export default memo(Layout)

import React from 'react'

const pagesRoute = [
    {
        key: 'dashboard',
        path: "/dashboard",
        component: React.lazy(() => import('../../views/Dashboard'))
    },
    {
        key: 'office',
        path: `/office`,
        component: React.lazy(() => import('../../views/Offices'))
    },
    {
        key: 'master-view',
        path: `/master-view`,
        component: React.lazy(() => import('../../views/MasterView'))
    },
    {
        key: 'vehicle',
        path: `/vehicles`,
        component: React.lazy(() => import('../../views/Vehicles'))
    },
    {
        key: 'uploads',
        path: `/upload`,
        component: React.lazy(() => import('../../views/Uploads'))
    },
    {
        key: 'user',
        path: `/user`,
        component: React.lazy(() => import('../../views/User'))
    },
    {
        key: 'file-info',
        path: `/file-info`,
        component: React.lazy(() => import('../../views/FileInfo'))
    },
    {
        key: 'details',
        path: `/details`,
        component: React.lazy(() => import('../../views/Details'))
    },
    {
        key: 'code',
        path: `/code`,
        component: React.lazy(() => import('../../views/OTPs'))
    },
    {
        key: 'testing',
        path: `/testing`,
        component: React.lazy(() => import('../../views/Testing'))
    },
]

export default pagesRoute

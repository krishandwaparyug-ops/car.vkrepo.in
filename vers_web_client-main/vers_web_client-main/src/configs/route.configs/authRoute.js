import React from 'react'

const authRoute = [
    {
        key: 'signIn',
        path: `/sign-in`,
        component: React.lazy(() => import('../../views/Auth')),
        authority: [],
    },
]

export default authRoute

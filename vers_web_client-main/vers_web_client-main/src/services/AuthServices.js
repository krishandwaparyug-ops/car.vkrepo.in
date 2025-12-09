import ApiService from './ApiService'

export async function apiSendOTP(data) {
    return ApiService.fetchData({
        url: '/v1/auth/send',
        method: 'post',
        data,
    })
}

export async function apiSignIn(data) {
    return ApiService.fetchData({
        url: '/v1/auth/login',
        method: 'post',
        data,
    })
}

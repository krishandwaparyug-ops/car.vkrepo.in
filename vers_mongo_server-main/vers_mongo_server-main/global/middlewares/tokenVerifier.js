const jwt = require("jsonwebtoken");
const responseError = require("../../errors/responseError");

const tokenVerifier = async (req, res, next) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return next(responseError(401, "You are not authenticated!"))
        }
        const tokenString = token.split(' ')[1]
        const validToken = await jwt.verify(tokenString, process.env.PRIVATEKEY);
        if (validToken) {
            const currentServerTime = Math.floor(Date.now() / 1000);
            const tokenExpirationTime = validToken.exp;
            if (tokenExpirationTime < currentServerTime) {
                return next(responseError(401, 'Your token has been expired'))
            } else {
                req.tokenData = { ...validToken }
                return next()
            }
        } else {
            return next(responseError(401, 'Sending invalid token'))
        }
    } catch (error) {
        return next(responseError(401, 'Your token has been expired'))
    }
}




module.exports = { tokenVerifier }
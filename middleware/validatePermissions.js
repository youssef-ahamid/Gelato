const { verifyJWT } = require("../helpers/JWT")
const { e } = require("../utils")

module.exports = (scope) => {
    return (req, res, next) => {
        if (!scope) return next()

        const JWT = req.headers['authorization']?.substring('JWT '.length)
        if (!JWT) return e(401, res, "No token provided")

        verifyJWT(JWT, (error, decoded) => {
            if (error) return e(403, res, "Invalid JWT", error)

            if (scope.includes('.id')) scope = scope.replace('.id', `.${req.params.id}`);
            if (!decoded.scopes.includes(scope)) return e(403, res, 'Insufficient permissions')

            next()
        })
    }
};

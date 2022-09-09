const jwt = require('jsonwebtoken');

module.exports.verifyJWT = async (token, cb) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => cb(err, decoded));
};

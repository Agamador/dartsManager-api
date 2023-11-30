const db = require('./db.js');
const jwt = require('jsonwebtoken');

const secretKey = '&N!6/3qtpEl;cn+>.C2<seu,5}EPpMhw';

function createToken(user) {
    const payload = {
        user: {
            id: user.id,
            name: user.name,
        },
        exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // Expires in 12 hours
    };
    return jwt.sign(payload, secretKey);
}

function verifyToken(req, res, next) {
    const token = req.headers.authorization.split(' ')[1]

    if (!token) {
        return res.status(401).json({ message: 'Token not provided' });
    }
    console.log(token);
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            console.log(err)
            return res.status(401).json({ message: 'Invalid token' });
        }

        if (req.body.user.id != decoded.user.id && req.body.user.name != decoded.user.name) {
            console.log(req.body.user, decoded.user)
            return res.status(401).json({ message: 'Invalid user' });
        }
        next();
    });
}

module.exports = { createToken, verifyToken };
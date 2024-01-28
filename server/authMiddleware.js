const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];

    if (!bearerHeader) {
        return res.status(403).send('A token is required for authentication');
    }

    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];

    try {
        const decoded = jwt.verify(bearerToken, process.env.TOKEN_KEY);
        req.user = decoded;
    } catch (err) {
        return res.status(401).send('Invalid Token');
    }

    return next();
};


module.exports = verifyToken;
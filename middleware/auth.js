const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.USER_TOKEN);
        const userId = decodedToken.userId;
        if (req.body.userId && req.body.userId !== userId) {
            throw "Utilisateur non authorisé";
        }else {
            next();
        }
    }catch {
        res.status(401).json({
            error: new Error("Requête non valide")
        });
    }
};
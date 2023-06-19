const jwt = require('jsonwebtoken')

module.exports = {
    verifyToken: (req, res, next) => {
        let token = req.headers.authorization

        if (!token) {
            return res.status(401).send({
                success: false,
                message: 'unathorize access',
                data: null
            })
        }

        try {

            token = token.split(" ")[1]

            if (token === 'null' || !token) {
                return res.status(401).send({
                    success: false,
                    message: 'unathorize access',
                    data: null
                })
            }

            let verifiedUser = jwt.verify(token, 'secretKey')

            if (!verifiedUser) return res.status(401).send({
                success: false,
                message: 'unathorize access',
                data: null
            })

            req.user = verifiedUser
            next();

        } catch (error) {
            res.status(500).send({
                success: false,
                message: error.message,
                data: null
            })
        }
    }
}
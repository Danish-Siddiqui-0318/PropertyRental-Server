const jwt = require("jsonwebtoken");

async function jwtMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, no token provided"
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, token missing"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Store logged-in user's information
        req.user = {
            userId: decoded.userId,
            role: decoded.role
        };

        next();

    } catch (error) {

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token has expired, please login again"
            });
        }

        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }
}

module.exports = jwtMiddleware;
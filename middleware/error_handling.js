const errorMiddleware = (err, req, res, next) => {

    const statusCode = res.statusCode >= 400
        ? res.statusCode
        : 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
};

module.exports = errorMiddleware;
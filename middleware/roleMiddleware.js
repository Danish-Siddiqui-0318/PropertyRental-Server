const router = require("../routes/authRoute");
const roleMiddleware=(...allowedRoles)=>{
    return (req, res, next) => {
        if(!req.user){
            res.status(401).json({
                success: false,
                message: 'Not Authorized'
            })
        }
        if(!allowedRoles.includes(req.user.role)){
            res.status(403).json({
                success: false,
                message: 'Access Denied'
            })
        }
        next();
    };
};

module.exports = router;
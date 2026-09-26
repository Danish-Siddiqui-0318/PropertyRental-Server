const express = require("express");
const router = express.Router();

const jwtMiddleWare = require("../middleware/jwt_token_middleware");
const adminController = require("../controllers/adminController");
//Admin Apis
router.get(
    "/users",
    jwtMiddleWare,
    adminController.getUsers
);
router.get(
    "/users/:id",
    jwtMiddleWare,
    adminController.getUserById
);
router.get(
    "/properties",
    jwtMiddleWare,
    adminController.getProperties
);
router.get(
    "/rentals",
    jwtMiddleWare,
    adminController.getRentals
);

router.get(
    "/payments",
    jwtMiddleWare,
    adminController.getPayments
);

router.get(
    "/transactions",
    jwtMiddleWare,
    adminController.getTransactions
);

module.exports = router;
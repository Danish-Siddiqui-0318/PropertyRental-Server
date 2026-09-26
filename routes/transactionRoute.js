const express = require("express");
const router = express.Router();

const jwtMiddleWare = require("../middleware/jwt_token_middleware");
const transactionController = require("../controllers/transactionController");


// #34 View transaction history
router.get(
    "/",
    jwtMiddleWare,
    transactionController.getTransactions
);


// #36 Owner views earnings
router.get(
    "/owner",
    jwtMiddleWare,
    transactionController.getOwnerEarnings
);


// #35 View transaction details
router.get(
    "/:id",
    jwtMiddleWare,
    transactionController.getTransactionById
);


module.exports = router;
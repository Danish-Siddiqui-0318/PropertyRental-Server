const express = require("express");
const router = express.Router();

const jwtMiddleWare = require('../middleware/jwt_token_middleware');
const paymentController = require("../controllers/paymentController");


// #29 View payment records
router.get(
    "/",
    jwtMiddleWare,
    paymentController.getPayments
);

router.get(
    "/:id/history",
    jwtMiddleWare,
    paymentController.getPaymentHistory
);


// #30 View payment details
router.get(
    "/:id",
    jwtMiddleWare,
    paymentController.getPaymentById
);


// Stripe Checkout
router.post(
    "/create-checkout-session",
    jwtMiddleWare,
    paymentController.createCheckoutSession
);


module.exports = router;
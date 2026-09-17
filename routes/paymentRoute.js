const express = require("express");
const router = express.Router();

const jwtMiddleWare = require('../middleware/jwt_token_middleware');
const paymentController = require("../controllers/paymentController");

router.post(
    "/create-checkout-session",
    jwtMiddleWare,
    paymentController.createCheckoutSession
);

module.exports = router;
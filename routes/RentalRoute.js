const rentalController = require("../controllers/rentalController");
const express = require('express');
const router = express.Router();
const jwtMiddleWare = require('../middleware/jwt_token_middleware');


router.post(
    "/request",
    jwtMiddleWare,
    rentalController.createRentalRequest
);
router.get(
    "/",
    jwtMiddleWare,
    rentalController.getRentals
);
router.get(
    "/:id",
    jwtMiddleWare,
    rentalController.getRentalById
);
router.put(
    "/:id/approve",
    jwtMiddleWare,
    rentalController.approveRental
);
router.put(
    "/:id/terminate",
    jwtMiddleWare,
    rentalController.terminateRental
);
module.exports = router;
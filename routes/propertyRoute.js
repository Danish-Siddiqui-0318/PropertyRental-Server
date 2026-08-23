const express = require('express');
const router = express.Router();

const propertyController = require('../controllers/propertyController');
const jwtMiddleWare = require('../middleware/jwt_token_middleware');
const upload = require("../middleware/uploadMiddleWare")

router.post("/", jwtMiddleWare, upload.array("photos", 10), propertyController.createProperty);

module.exports = router;
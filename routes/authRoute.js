const express = require('express');

const router = express.Router();

const authController = require('../controllers/authController');
const jwtMiddleware = require('../middleware/jwt_token_middleware');


// Signup
router.post('/signup', authController.signup);
// Login
router.post('/login', authController.login);
// Profile
router.get("/profile", jwtMiddleware, authController.getProfile)
router.put("/profile", jwtMiddleware, authController.updateProfile);

// Change Password
router.put("/change-password", jwtMiddleware, authController.changePassword)
module.exports = router;
const express = require('express');
const router = express.Router();
const { register, login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../Middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (require valid JWT)
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;

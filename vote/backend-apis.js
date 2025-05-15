// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Import routes
const authRoutes = require('./routes/auth');
const loginRecordRoutes = require('./routes/loginRecords');
const linkRoutes = require('./routes/links');
const ipRoutes = require('./routes/ips');
const accessRoutes = require('./routes/access');
const imageRoutes = require('./routes/images');
const contestantRoutes = require('./routes/contestants');
const contentRoutes = require('./routes/content');
const notificationRoutes = require('./routes/notifications');
const activityRoutes = require('./routes/activity');
const settingsRoutes = require('./routes/settings');
const telegramRoutes = require('./routes/telegram');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/auth');

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/admin_dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/login-records', authMiddleware, loginRecordRoutes);
app.use('/api/links', authMiddleware, linkRoutes);
app.use('/api/ips', authMiddleware, ipRoutes);
app.use('/api/access', authMiddleware, accessRoutes);
app.use('/api/images', authMiddleware, imageRoutes);
app.use('/api/contestants', authMiddleware, contestantRoutes);
app.use('/api/content', authMiddleware, contentRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);
app.use('/api/activity', authMiddleware, activityRoutes);
app.use('/api/settings', authMiddleware, settingsRoutes);
app.use('/api/telegram', authMiddleware, telegramRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
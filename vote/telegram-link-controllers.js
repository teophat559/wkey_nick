// controllers/telegramController.js
const TelegramConfig = require('../models/TelegramConfig');
const telegramService = require('../services/telegramService');
const ActivityLog = require('../models/ActivityLog');
const { validationResult } = require('express-validator');

class TelegramController {
  // Get current Telegram configuration
  async getConfig(req, res) {
    try {
      const config = await TelegramConfig.findOne({ isActive: true })
        .populate('updatedBy', 'name email');

      if (!config) {
        return res.status(404).json({ message: 'Telegram configuration not found' });
      }

      // Hide sensitive information
      const safeConfig = {
        ...config.toObject(),
        botToken: config.botToken.substring(0, 10) + '...'
      };

      res.json({ config: safeConfig });
    } catch (error) {
      console.error('Get Telegram config error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Update Telegram configuration
  async updateConfig(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { 
        botToken, 
        chatId, 
        channelName,
        autoSendLogin,
        messageTemplate 
      } = req.body;

      // Find existing config or create new one
      let config = await TelegramConfig.findOne({ isActive: true });
      
      if (!config) {
        config = new TelegramConfig();
      }

      // Update config
      config.botToken = botToken;
      config.chatId = chatId;
      config.channelName = channelName;
      config.autoSendLogin = autoSendLogin || config.autoSendLogin;
      config.messageTemplate = messageTemplate || config.messageTemplate;
      config.updatedBy = req.user._id;

      await config.save();

      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'Update Telegram Config',
        entity: 'TelegramConfig',
        entityId: config._id,
        details: 'Updated Telegram bot configuration',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        message: 'Telegram configuration updated successfully',
        config: {
          ...config.toObject(),
          botToken: config.botToken.substring(0, 10) + '...'
        }
      });
    } catch (error) {
      console.error('Update Telegram config error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Test Telegram connection
  async testConnection(req, res) {
    try {
      const result = await telegramService.testConnection();

      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'Test Telegram Connection',
        entity: 'TelegramConfig',
        details: `Connection test ${result.success ? 'successful' : 'failed'}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        result: result.success ? 'success' : 'failed'
      });

      res.json({
        message: result.success ? 'Connection successful' : 'Connection failed',
        result
      });
    } catch (error) {
      console.error('Test Telegram connection error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Send test message
  async sendTestMessage(req, res) {
    try {
      const { message = 'Test message from Admin Dashboard' } = req.body;

      const result = await telegramService.sendMessage(message);

      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'Send Telegram Test Message',
        entity: 'TelegramConfig',
        details: 'Sent test message to Telegram',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        message: 'Test message sent successfully',
        result
      });
    } catch (error) {
      console.error('Send test message error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Get Telegram statistics
  async getStatistics(req, res) {
    try {
      const config = await TelegramConfig.findOne({ isActive: true });

      if (!config) {
        return res.status(404).json({ message: 'Telegram configuration not found' });
      }

      const statistics = {
        messagesSent: config.statistics.messagesSent,
        lastMessageSent: config.statistics.lastMessageSent,
        errors: config.statistics.errors,
        lastConnectionTest: config.lastConnectionTest,
        lastError: config.lastError,
        isConnected: !config.lastError || 
          (config.lastConnectionTest && 
           config.lastConnectionTest > (config.lastError?.timestamp || 0))
      };

      res.json({ statistics });
    } catch (error) {
      console.error('Get Telegram statistics error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Toggle auto-send settings
  async toggleAutoSend(req, res) {
    try {
      const { type, enabled } = req.body;

      if (!['success', 'failed', 'otpGenerated'].includes(type)) {
        return res.status(400).json({ message: 'Invalid auto-send type' });
      }

      const config = await TelegramConfig.findOne({ isActive: true });
      if (!config) {
        return res.status(404).json({ message: 'Telegram configuration not found' });
      }

      config.autoSendLogin[type] = enabled;
      config.updatedBy = req.user._id;
      await config.save();

      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'Toggle Telegram Auto-Send',
        entity: 'TelegramConfig',
        entityId: config._id,
        details: `${enabled ? 'Enabled' : 'Disabled'} auto-send for ${type}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        message: `Auto-send ${enabled ? 'enabled' : 'disabled'} for ${type}`,
        autoSendLogin: config.autoSendLogin
      });
    } catch (error) {
      console.error('Toggle auto-send error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Update message template
  async updateTemplate(req, res) {
    try {
      const { type, template } = req.body;

      if (!['login', 'bulk'].includes(type)) {
        return res.status(400).json({ message: 'Invalid template type' });
      }

      const config = await TelegramConfig.findOne({ isActive: true });
      if (!config) {
        return res.status(404).json({ message: 'Telegram configuration not found' });
      }

      config.messageTemplate[type] = template;
      config.updatedBy = req.user._id;
      await config.save();

      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'Update Telegram Template',
        entity: 'TelegramConfig',
        entityId: config._id,
        details: `Updated ${type} message template`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        message: `${type} template updated successfully`,
        messageTemplate: config.messageTemplate
      });
    } catch (error) {
      console.error('Update template error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = new TelegramController();

// controllers/linkController.js
const Link = require('../models/Link');
const ActivityLog = require('../models/ActivityLog');
const { validationResult } = require('express-validator');

class LinkController {
  // Get all links with pagination and filters
  async getAll(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status,
        category,
        search
      } = req.query;

      // Build filter
      const filter = {};
      if (status) filter.status = status;
      if (category) filter.category = { $regex: category, $options: 'i' };
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { url: { $regex: search, $options: 'i' } }
        ];
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const total = await Link.countDocuments(filter);

      // Get links
      const links = await Link.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      res.json({
        links,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get links error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Get single link
  async getById(req, res) {
    try {
      const link = await Link.findById(req.params.id)
        .populate('createdBy', 'name email');

      if (!link) {
        return res.status(404).json({ message: 'Link not found' });
      }

      res.json({ link });
    } catch (error) {
      console.error('Get link error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Create new link
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const linkData = {
        ...req.body,
        createdBy: req.user._id
      };

      const link = new Link(linkData);
      await link.save();

      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'Create Link',
        entity: 'Link',
        entityId: link._id,
        details: `Created link: ${link.title}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      await link.populate('createdBy', 'name email');

      res.status(201).json({
        message: 'Link created successfully',
        link
      });
    } catch (error) {
      console.error('Create link error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Update link
  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const link = await Link.findById(req.params.id);
      if (!link) {
        return res.status(404).json({ message: 'Link not found' });
      }

      // Store old values for activity log
      const oldValues = link.toObject();

      // Update link
      Object.assign(link, req.body);
      await link.save();

      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'Update Link',
        entity: 'Link',
        entityId: link._id,
        details: `Updated link: ${link.title}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        changes: {
          old: oldValues,
          new: link.toObject()
        }
      });

      await link.populate('createdBy', 'name email');

      res.json({
        message: 'Link updated successfully',
        link
      });
    } catch (error) {
      console.error('Update link error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Delete link
  async delete(req, res) {
    try {
      const link = await Link.findById(req.params.id);
      if (!link) {
        return res.status(404).json({ message: 'Link not found' });
      }

      await Link.findByIdAndDelete(req.params.id);

      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'Delete Link',
        entity: 'Link',
        entityId: link._id,
        details: `Deleted link: ${link.title}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({ message: 'Link deleted successfully' });
    } catch (error) {
      console.error('Delete link error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Track link click
  async trackClick(req, res) {
    try {
      const { shortUrl } = req.params;
      
      const link = await Link.findOne({ shortUrl });
      if (!link) {
        return res.status(404).json({ message: 'Link not found' });
      }

      // Increment click count
      link.clicks += 1;
      await link.save();

      // Redirect to the actual URL
      res.redirect(link.url);
    } catch (error) {
      console.error('Track click error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Bulk update status
  async bulkUpdateStatus(req, res) {
    try {
      const { linkIds, status } = req.body;

      if (!linkIds || !Array.isArray(linkIds)) {
        return res.status(400).json({ message: 'Link IDs array required' });
      }

      if (!['active', 'inactive', 'scheduled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const result = await Link.updateMany(
        { _id: { $in: linkIds } },
        { status }
      );

      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'Bulk Update Links',
        entity: 'Link',
        details: `Updated status to ${status} for ${result.matchedCount} links`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        message: `Updated ${result.matchedCount} links`,
        updated: result.matchedCount
      });
    } catch (error) {
      console.error('Bulk update status error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Bulk delete
  async bulkDelete(req, res) {
    try {
      const { linkIds } = req.body;

      if (!linkIds || !Array.isArray(linkIds)) {
        return res.status(400).json({ message: 'Link IDs array required' });
      }

      const result = await Link.deleteMany({ _id: { $in: linkIds } });

      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'Bulk Delete Links',
        entity: 'Link',
        details: `Deleted ${result.deletedCount} links`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        message: `Deleted ${result.deletedCount} links`,
        deleted: result.deletedCount
      });
    } catch (error) {
      console.error('Bulk delete error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Get link statistics
  async getStatistics(req, res) {
    try {
      const stats = await Link.aggregate([
        {
          $group: {
            _id: null,
            totalLinks: { $sum: 1 },
            totalClicks: { $sum: '$clicks' },
            activeLinks: { 
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            },
            inactiveLinks: { 
              $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
            }
          }
        }
      ]);

      const result = stats[0] || {
        totalLinks: 0,
        totalClicks: 0,
        activeLinks: 0,
        inactiveLinks: 0
      };

      res.json({ statistics: result });
    } catch (error) {
      console.error('Get link statistics error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = new LinkController();
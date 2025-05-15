// controllers/ipController.js
const IPRecord = require('../models/IPRecord');
const ActivityLog = require('../models/ActivityLog');
const { validationResult } = require('express-validator');

class IPController {
  // Get all IP records with filters
  async getAll(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status,
        search,
        startDate,
        endDate
      } = req.query;

      // Build filter
      const filter = {};
      if (status) filter.status = status;
      if (search) {
        filter.$or = [
          { ipAddress: { $regex: search, $options: 'i' } },
          { user: { $regex: search, $options: 'i' } },
          { 'location.city': { $regex: search, $options: 'i' } }
        ];
      }
      if (startDate || endDate) {
        filter.lastActivity = {};
        if (startDate) filter.lastActivity.$gte = new Date(startDate);
        if (endDate) filter.lastActivity.$lte = new Date(endDate);
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const total = await IPRecord.countDocuments(filter);

      // Get records
      const ipRecords = await IPRecord.find(filter)
        .populate('createdBy', 'name email')
        .sort({ lastActivity: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      res.json({
        ipRecords,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get IP records error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Get single IP record
  async getById(req, res) {
    try {
      const ipRecord = await IPRecord.findById(req.params.id)
        .populate('createdBy', 'name email');

      if (!ipRecord) {
        return res.status(404).json({ message: 'IP record not found' });
      }

      res.json({ ipRecord });
    } catch (error) {
      console.error('Get IP record error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Create new IP record
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check if IP already exists
      const existingIP = await IPRecord.findOne({ ipAddress: req.body.ipAddress });
      if (existingIP) {
        return res.status(400).json({ message: 'IP address already exists' });
      }

      const ipData = {
        ...req.body,
        createdBy: req.user._id
      };

      const ipRecord = new IPRecord(ipData);
      await ipRecord.save();

      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'Create IP Record',
        entity: 'IPRecord',
        entityId: ipRecord._id,
        details: `Created IP record for ${ipRecord.ipAddress}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      await ipRecord.populate('createdBy', 'name email');

      res.status(201).json({
        message: 'IP record created successfully',
        ipRecord
      });
    } catch (error) {
      console.error('Create IP record error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Update IP record
  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const ipRecord = await IPRecord.findById(req.params.id);
      if (!ipRecord) {
        return res.status(404).json({ message: 'IP record not found' });
      }

      // Store old values for activity log
      const oldValues = ipRecord.toObject();

      // Update record
      Object.assign(ipRecord, req.body);
      ipRecord.lastActivity = new Date();
      await ipRecord.save();

      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'Update IP Record',
        entity: 'IPRecord',
        entityId: ipRecord._id,
        details: `Updated IP record for ${ipRecord.ipAddress}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        changes: {
          old: oldValues,
          new: ipRecord.toObject()
        }
      });

      await ipRecord.populate('createdBy', 'name email');

      res.json({
        message: 'IP record updated successfully',
        ipRecord
      });
    } catch (error) {
      console.error('Update IP record error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Delete IP record
  async delete(req, res) {
    try {
      const ipRecord = await IPRecord.findById(req.params.id);
      if (!ipRecord) {
        return res.status(404).json({ message: 'IP record not found' });
      }

      await IPRecord.findByIdAndDelete(req.params.id);

      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'Delete IP Record',
        entity: 'IPRecord',
        entityId: ipRecord._id,
        details: `Deleted IP record for ${ipRecord.ipAddress}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({ message: 'IP record deleted successfully' });
    } catch (error) {
      console.error('Delete IP record error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Block IP address
  async blockIP(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { ipAddress, blockReason, blockUntil } = req.body;

      // Find or create IP record
      let ipRecord = await IPRecord.findOne({ ipAddress });
      
      if (!ipRecord) {
        ipRecord = new IPRecord({
          ipAddress,
          user: 'Unknown',
          createdBy: req.user._id
        });
      }

      // Update block info
      ipRecord.status = 'blocked';
      ipRecord.blockReason = blockReason;
      ipRecord.blockUntil = blockUntil ? new Date(blockUntil) : undefined;
      ipRecord.lastActivity = new Date();

      await ipRecord.save();

      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'Block IP',
        entity: 'IPRecord',
        entityId: ipRecord._id,
        details: `Blocked IP ${ipAddress}. Reason: ${blockReason}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        message: 'IP address blocked successfully',
        ipRecord
      });
    } catch (error) {
      console.error('Block IP error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Unblock IP address
  async unblockIP(req, res) {
    try {
      const ipRecord = await IPRecord.findById(req.params.id);
      if (!ipRecord) {
        return res.status(404).json({ message: 'IP record not found' });
      }

      ipRecord.status = 'allowed';
      ipRecord.blockReason = undefined;
      ipRecord.blockUntil = undefined;
      ipRecord.lastActivity = new Date();

      await ipRecord.save();

      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'Unblock IP',
        entity: 'IPRecord',
        entityId: ipRecord._id,
        details: `Unblocked IP ${ipRecord.ipAddress}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        message: 'IP address unblocked successfully',
        ipRecord
      });
    } catch (error) {
      console.error('Unblock IP error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Check if IP is blocked (public endpoint)
  async checkIP(req, res) {
    try {
      const { ip } = req.params;
      
      const ipRecord = await IPRecord.findOne({ ipAddress: ip });
      
      if (!ipRecord) {
        return res.json({ blocked: false });
      }

      // Check if block has expired
      if (ipRecord.status === 'blocked' && ipRecord.blockUntil && ipRecord.blockUntil < new Date()) {
        ipRecord.status = 'allowed';
        ipRecord.blockReason = undefined;
        ipRecord.blockUntil = undefined;
        await ipRecord.save();
      }

      res.json({
        blocked: ipRecord.status === 'blocked',
        status: ipRecord.status,
        reason: ipRecord.blockReason,
        blockUntil: ipRecord.blockUntil
      });
    } catch (error) {
      console.error('Check IP error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Get IP statistics
  async getStatistics(req, res) {
    try {
      const stats = await IPRecord.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const result = {
        total: 0,
        allowed: 0,
        blocked: 0,
        suspicious: 0
      };

      stats.forEach(stat => {
        result.total += stat.count;
        result[stat._id] = stat.count;
      });

      // Get recent activity
      const recentActivity = await IPRecord.find({
        lastActivity: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }).countDocuments();

      result.recentActivity = recentActivity;

      res.json({ statistics: result });
    } catch (error) {
      console.error('Get IP statistics error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Update login attempts
  async updateLoginAttempts(req, res) {
    try {
      const { ipAddress, success = false } = req.body;

      let ipRecord = await IPRecord.findOne({ ipAddress });
      
      if (!ipRecord) {
        ipRecord = new IPRecord({
          ipAddress,
          user: 'Unknown',
          createdBy: req.user._id
        });
      }

      if (success) {
        ipRecord.loginAttempts = 0;
        ipRecord.status = 'allowed';
      } else {
        ipRecord.loginAttempts += 1;
        
        // Auto-block after 5 failed attempts
        if (ipRecord.loginAttempts >= 5) {
          ipRecord.status = 'blocked';
          ipRecord.blockReason = 'Too many failed login attempts';
          ipRecord.blockUntil = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        } else if (ipRecord.loginAttempts >= 3) {
          ipRecord.status = 'suspicious';
        }
      }

      ipRecord.lastActivity = new Date();
      await ipRecord.save();

      res.json({
        message: 'Login attempts updated',
        ipRecord
      });
    } catch (error) {
      console.error('Update login attempts error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = new IPController();

// controllers/accessController.js
const OAuthConfig = require('../models/OAuthConfig');
const ActivityLog = require('../models/ActivityLog');
const { validationResult } = require('express-validator');

class AccessController {
  // Get all OAuth configurations
  async getAllConfigs(req, res) {
    try {
      const configs = await OAuthConfig.find()
        .populate('updatedBy', 'name email')
        .sort({ provider: 1 });

      // Hide sensitive information
      const safeConfigs = configs.map(config => ({
        ...config.toObject(),
        clientSecret: config.clientSecret.substring(0, 4) + '...'
      }));

      res.json({ configs: safeConfigs });
    } catch (error) {
      console.error('Get OAuth configs error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Get single OAuth configuration
  async getConfig(req, res) {
    try {
      const { provider } = req.params;
      
      const config = await OAuthConfig.findOne({ provider })
        .populate('updatedBy', 'name email');

      if (!config) {
        return res.status(404).json({ message: 'OAuth configuration not found' });
      }

      // Hide sensitive information
      const safeConfig = {
        ...config.toObject(),
        clientSecret: config.clientSecret.substring(0, 4) + '...'
      };

      res.json({ config: safeConfig });
    } catch (error) {
      console.error('Get OAuth config error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Update OAuth configuration
  async updateConfig(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { provider } = req.params;
      const { clientId, clientSecret, scope, callbackUrl, isActive, settings } = req.body;

      // Find existing config or create new one
      let config = await OAuthConfig.findOne({ provider });
      
      if (!config) {
        config = new OAuthConfig({ provider });
      }

      // Update config
      config.clientId = clientId;
      if (clientSecret && !clientSecret.includes('...')) {
        config.clientSecret = clientSecret;
      }
      config.scope = scope || config.scope;
      config.callbackUrl = callbackUrl;
      config.isActive = isActive !== undefined ? isActive : config.isActive;
      config.settings = settings || config.settings;
      config.updatedBy = req.user._id;

      await config.save();

      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'Update OAuth Config',
        entity: 'OAuthConfig',
        entityId: config._id,
        details: `Updated ${provider} OAuth configuration`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Hide sensitive information in response
      const safeConfig = {
        ...config.toObject(),
        clientSecret: config.clientSecret.substring(0, 4) + '...'
      };

      res.json({
        message: `${provider} configuration updated successfully`,
        config: safeConfig
      });
    } catch (error) {
      console.error('Update OAuth config error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Test OAuth configuration
  async testConfig(req, res) {
    try {
      const { provider } = req.params;
      
      const config = await OAuthConfig.findOne({ provider });
      if (!config) {
        return res.status(404).json({ message: 'OAuth configuration not found' });
      }

      // Simulate OAuth test (in real implementation, this would make actual OAuth requests)
      const testResult = {
        provider,
        clientId: config.clientId,
        callbackUrl: config.callbackUrl,
        scope: config.scope,
        status: config.isActive ? 'active' : 'inactive',
        testSuccess: true,
        message: 'Configuration appears valid'
      };

      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'Test OAuth Config',
        entity: 'OAuthConfig',
        entityId: config._id,
        details: `Tested ${provider} OAuth configuration`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        message: 'OAuth configuration test completed',
        result: testResult
      });
    } catch (error) {
      console.error('Test OAuth config error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Get OAuth statistics
  async getStatistics(req, res) {
    try {
      const stats = await OAuthConfig.aggregate([
        {
          $group: {
            _id: '$isActive',
            count: { $sum: 1 },
            providers: { $push: '$provider' }
          }
        }
      ]);

      const result = {
        total: 0,
        active: 0,
        inactive: 0,
        providers: []
      };

      stats.forEach(stat => {
        result.total += stat.count;
        if (stat._id) {
          result.active += stat.count;
          result.providers.push(...stat.providers);
        } else {
          result.inactive += stat.count;
        }
      });

      res.json({ statistics: result });
    } catch (error) {
      console.error('Get OAuth statistics error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Enable/Disable OAuth provider
  async toggleProvider(req, res) {
    try {
      const { provider } = req.params;
      const { isActive } = req.body;

      const config = await OAuthConfig.findOne({ provider });
      if (!config) {
        return res.status(404).json({ message: 'OAuth configuration not found' });
      }

      config.isActive = isActive;
      config.updatedBy = req.user._id;
      await config.save();

      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'Toggle OAuth Provider',
        entity: 'OAuthConfig',
        entityId: config._id,
        details: `${isActive ? 'Enabled' : 'Disabled'} ${provider} OAuth`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        message: `${provider} OAuth ${isActive ? 'enabled' : 'disabled'}`,
        config
      });
    } catch (error) {
      console.error('Toggle OAuth provider error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Delete OAuth configuration
  async deleteConfig(req, res) {
    try {
      const { provider } = req.params;
      
      const config = await OAuthConfig.findOne({ provider });
      if (!config) {
        return res.status(404).json({ message: 'OAuth configuration not found' });
      }

      await OAuthConfig.findByIdAndDelete(config._id);

      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'Delete OAuth Config',
        entity: 'OAuthConfig',
        entityId: config._id,
        details: `Deleted ${provider} OAuth configuration`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({ message: `${provider} configuration deleted successfully` });
    } catch (error) {
      console.error('Delete OAuth config error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Get available OAuth providers
  async getAvailableProviders(req, res) {
    try {
      const providers = [
        {
          id: 'facebook',
          name: 'Facebook',
          description: 'Allow users to login with Facebook',
          icon: 'facebook',
          color: '#1877F2'
        },
        {
          id: 'google',
          name: 'Google',
          description: 'Allow users to login with Google',
          icon: 'google',
          color: '#DB4437'
        },
        {
          id: 'github',
          name: 'GitHub',
          description: 'Allow users to login with GitHub',
          icon: 'github',
          color: '#333'
        },
        {
          id: 'twitter',
          name: 'Twitter',
          description: 'Allow users to login with Twitter',
          icon: 'twitter',
          color: '#1DA1F2'
        }
      ];

      // Check which providers are already configured
      const configuredProviders = await OAuthConfig.find().select('provider');
      const configuredIds = configuredProviders.map(c => c.provider);

      const providersWithStatus = providers.map(provider => ({
        ...provider,
        configured: configuredIds.includes(provider.id)
      }));

      res.json({ providers: providersWithStatus });
    } catch (error) {
      console.error('Get available providers error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = new AccessController();
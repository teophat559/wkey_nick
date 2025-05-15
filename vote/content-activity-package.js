// controllers/contentController.js
const Article = require('../models/Article');
const Banner = require('../models/Banner');
const Block = require('../models/Block');
const Image = require('../models/Image');
const ActivityLog = require('../models/ActivityLog');
const { validationResult } = require('express-validator');

class ContentController {
  // ARTICLES
  async getAllArticles(req, res) {
    try {
      const { page = 1, limit = 10, category, status, search } = req.query;

      const filter = {};
      if (category) filter.category = category;
      if (status) filter.status = status;
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (page - 1) * limit;
      const total = await Article.countDocuments(filter);

      const articles = await Article.find(filter)
        .populate('author', 'name email')
        .populate('featuredImage')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      res.json({
        articles,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get articles error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getArticleById(req, res) {
    try {
      const article = await Article.findById(req.params.id)
        .populate('author', 'name email')
        .populate('featuredImage');

      if (!article) {
        return res.status(404).json({ message: 'Article not found' });
      }

      res.json({ article });
    } catch (error) {
      console.error('Get article error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async createArticle(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const articleData = {
        ...req.body,
        author: req.user._id
      };

      const article = new Article(articleData);
      await article.save();

      await ActivityLog.create({
        user: req.user._id,
        action: 'Create Article',
        entity: 'Article',
        entityId: article._id,
        details: `Created article: ${article.title}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      await article.populate(['author', 'featuredImage']);

      res.status(201).json({
        message: 'Article created successfully',
        article
      });
    } catch (error) {
      console.error('Create article error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async updateArticle(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const article = await Article.findById(req.params.id);
      if (!article) {
        return res.status(404).json({ message: 'Article not found' });
      }

      const oldValues = article.toObject();
      Object.assign(article, req.body);
      await article.save();

      await ActivityLog.create({
        user: req.user._id,
        action: 'Update Article',
        entity: 'Article',
        entityId: article._id,
        details: `Updated article: ${article.title}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        changes: { old: oldValues, new: article.toObject() }
      });

      await article.populate(['author', 'featuredImage']);

      res.json({
        message: 'Article updated successfully',
        article
      });
    } catch (error) {
      console.error('Update article error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async deleteArticle(req, res) {
    try {
      const article = await Article.findById(req.params.id);
      if (!article) {
        return res.status(404).json({ message: 'Article not found' });
      }

      await Article.findByIdAndDelete(req.params.id);

      await ActivityLog.create({
        user: req.user._id,
        action: 'Delete Article',
        entity: 'Article',
        entityId: article._id,
        details: `Deleted article: ${article.title}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({ message: 'Article deleted successfully' });
    } catch (error) {
      console.error('Delete article error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // BANNERS
  async getAllBanners(req, res) {
    try {
      const { page = 1, limit = 10, position, status } = req.query;

      const filter = {};
      if (position) filter.position = position;
      if (status) filter.status = status;

      const skip = (page - 1) * limit;
      const total = await Banner.countDocuments(filter);

      const banners = await Banner.find(filter)
        .populate('image')
        .populate('createdBy', 'name email')
        .sort({ priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      res.json({
        banners,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get banners error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async createBanner(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const bannerData = {
        ...req.body,
        createdBy: req.user._id
      };

      const banner = new Banner(bannerData);
      await banner.save();

      await ActivityLog.create({
        user: req.user._id,
        action: 'Create Banner',
        entity: 'Banner',
        entityId: banner._id,
        details: `Created banner: ${banner.title}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      await banner.populate(['image', 'createdBy']);

      res.status(201).json({
        message: 'Banner created successfully',
        banner
      });
    } catch (error) {
      console.error('Create banner error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async updateBanner(req, res) {
    try {
      const banner = await Banner.findById(req.params.id);
      if (!banner) {
        return res.status(404).json({ message: 'Banner not found' });
      }

      Object.assign(banner, req.body);
      await banner.save();

      await ActivityLog.create({
        user: req.user._id,
        action: 'Update Banner',
        entity: 'Banner',
        entityId: banner._id,
        details: `Updated banner: ${banner.title}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      await banner.populate(['image', 'createdBy']);

      res.json({
        message: 'Banner updated successfully',
        banner
      });
    } catch (error) {
      console.error('Update banner error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async deleteBanner(req, res) {
    try {
      const banner = await Banner.findById(req.params.id);
      if (!banner) {
        return res.status(404).json({ message: 'Banner not found' });
      }

      await Banner.findByIdAndDelete(req.params.id);

      await ActivityLog.create({
        user: req.user._id,
        action: 'Delete Banner',
        entity: 'Banner',
        entityId: banner._id,
        details: `Deleted banner: ${banner.title}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({ message: 'Banner deleted successfully' });
    } catch (error) {
      console.error('Delete banner error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // BLOCKS
  async getAllBlocks(req, res) {
    try {
      const { type, status } = req.query;

      const filter = {};
      if (type) filter.type = type;
      if (status) filter.status = status;

      const blocks = await Block.find(filter)
        .populate('updatedBy', 'name email')
        .sort({ type: 1, name: 1 });

      res.json({ blocks });
    } catch (error) {
      console.error('Get blocks error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getBlockByName(req, res) {
    try {
      const block = await Block.findOne({ name: req.params.name })
        .populate('updatedBy', 'name email');

      if (!block) {
        return res.status(404).json({ message: 'Block not found' });
      }

      res.json({ block });
    } catch (error) {
      console.error('Get block error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async updateBlock(req, res) {
    try {
      const { name } = req.params;
      const { content, variables, status } = req.body;

      let block = await Block.findOne({ name });
      
      if (!block) {
        // Create new block if it doesn't exist
        block = new Block({
          name,
          content,
          type: req.body.type || 'content',
          updatedBy: req.user._id
        });
      } else {
        // Update existing block
        block.content = content;
        block.updatedBy = req.user._id;
      }

      if (variables) block.variables = variables;
      if (status) block.status = status;

      await block.save();

      await ActivityLog.create({
        user: req.user._id,
        action: 'Update Block',
        entity: 'Block',
        entityId: block._id,
        details: `Updated block: ${block.name}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      await block.populate('updatedBy', 'name email');

      res.json({
        message: 'Block updated successfully',
        block
      });
    } catch (error) {
      console.error('Update block error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = new ContentController();

// controllers/activityController.js
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const { validationResult } = require('express-validator');

class ActivityController {
  async getAll(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        user,
        action,
        entity,
        startDate,
        endDate,
        search 
      } = req.query;

      const filter = {};
      if (user) filter.user = user;
      if (action) filter.action = { $regex: action, $options: 'i' };
      if (entity) filter.entity = entity;
      if (search) {
        filter.$or = [
          { action: { $regex: search, $options: 'i' } },
          { details: { $regex: search, $options: 'i' } }
        ];
      }
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
      }

      const skip = (page - 1) * limit;
      const total = await ActivityLog.countDocuments(filter);

      const activities = await ActivityLog.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      res.json({
        activities,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get activities error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getById(req, res) {
    try {
      const activity = await ActivityLog.findById(req.params.id)
        .populate('user', 'name email');

      if (!activity) {
        return res.status(404).json({ message: 'Activity log not found' });
      }

      res.json({ activity });
    } catch (error) {
      console.error('Get activity error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

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

      // Get activity statistics
      const stats = await ActivityLog.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              action: '$action',
              entity: '$entity',
              date: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$createdAt'
                }
              }
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: {
              action: '$_id.action',
              entity: '$_id.entity'
            },
            totalCount: { $sum: '$count' },
            dailyData: {
              $push: {
                date: '$_id.date',
                count: '$count'
              }
            }
          }
        }
      ]);

      // Get top users
      const topUsers = await ActivityLog.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$user',
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $project: {
            _id: 1,
            count: 1,
            name: '$user.name',
            email: '$user.email'
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 10
        }
      ]);

      res.json({
        statistics: {
          total: stats.reduce((sum, stat) => sum + stat.totalCount, 0),
          byAction: stats,
          topUsers,
          period
        }
      });
    } catch (error) {
      console.error('Get activity statistics error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async export(req, res) {
    try {
      const { 
        user,
        action,
        entity,
        startDate,
        endDate 
      } = req.query;

      const filter = {};
      if (user) filter.user = user;
      if (action) filter.action = { $regex: action, $options: 'i' };
      if (entity) filter.entity = entity;
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
      }

      const activities = await ActivityLog.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(10000); // Limit to prevent too large exports

      const exportData = activities.map(activity => ({
        'Date': activity.createdAt.toISOString(),
        'User': activity.user?.name || 'Unknown',
        'Email': activity.user?.email || '',
        'Action': activity.action,
        'Entity': activity.entity,
        'Details': activity.details,
        'IP Address': activity.ipAddress,
        'Result': activity.result || 'success'
      }));

      res.json({
        message: 'Activity export completed',
        data: exportData,
        count: exportData.length
      });
    } catch (error) {
      console.error('Export activities error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async delete(req, res) {
    try {
      const activity = await ActivityLog.findById(req.params.id);
      if (!activity) {
        return res.status(404).json({ message: 'Activity log not found' });
      }

      await ActivityLog.findByIdAndDelete(req.params.id);

      res.json({ message: 'Activity log deleted successfully' });
    } catch (error) {
      console.error('Delete activity error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async cleanup(req, res) {
    try {
      const { olderThan = 90 } = req.body; // Days
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThan);

      const result = await ActivityLog.deleteMany({
        createdAt: { $lt: cutoffDate }
      });

      await ActivityLog.create({
        user: req.user._id,
        action: 'Cleanup Activity Logs',
        entity: 'ActivityLog',
        details: `Deleted ${result.deletedCount} activity logs older than ${olderThan} days`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        message: `Deleted ${result.deletedCount} activity logs`,
        deleted: result.deletedCount
      });
    } catch (error) {
      console.error('Cleanup activities error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = new ActivityController();

// package.json
{
  "name": "admin-dashboard-backend",
  "version": "1.0.0",
  "description": "Backend API for Admin Dashboard System",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "node demo.js test",
    "seed": "node demo.js seed",
    "lint": "eslint . --ext .js",
    "format": "prettier --write \"**/*.js\""
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "joi": "^17.9.2",
    "express-validator": "^7.0.1",
    "multer": "^1.4.5-lts.1",
    "sharp": "^0.32.0",
    "exceljs": "^4.3.0",
    "axios": "^1.5.0",
    "nodemailer": "^6.9.0",
    "twilio": "^4.15.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.10.0",
    "dotenv": "^16.3.0",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "eslint": "^8.47.0",
    "prettier": "^3.0.0",
    "jest": "^29.6.0",
    "supertest": "^6.3.0"
  },
  "keywords": [
    "admin",
    "dashboard",
    "api",
    "nodejs",
    "express",
    "mongodb",
    "contest",
    "management"
  ],
  "author": "Admin Dashboard Team",
  "license": "MIT",
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  }
}
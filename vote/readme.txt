# Admin Dashboard System - Backend API

A comprehensive backend API system for managing contests, participants, and administrative tasks with integrated Telegram notifications and multi-role access control.

## 🚀 Features

### Core Functionalities
- **Authentication & Authorization** - JWT-based with role management (Super Admin, Manager, Editor)
- **Login Records Management** - Track and manage login attempts with detailed information
- **Link Management** - Short URL generation with click tracking
- **IP Management** - Block/allow IP addresses with automatic blocking rules
- **Image Management** - Upload, resize, organize images with category management
- **Contestant Management** - CRUD operations with Excel import/export
- **Content Management** - Articles, banners, and dynamic blocks
- **Notification System** - Web notifications with multiple display types
- **Activity Logging** - Comprehensive audit trail of all system actions

### Telegram Integration
- ✅ **Auto-send login notifications** to Telegram channels
- ✅ **Bulk notification support** with customizable templates
- ✅ **Real-time status monitoring** and connection testing
- ✅ **Configurable message templates** with variables

### Advanced Features
- **Multi-OAuth Support** - Facebook, Google, GitHub, Twitter
- **Rate Limiting** - Protect APIs from abuse
- **File Upload** - Multer + Sharp for image processing
- **Excel Integration** - Import/export with ExcelJS
- **Email/SMS Notifications** - Nodemailer + Twilio
- **Role-based Permissions** - Granular access control

## 🛠️ Tech Stack

- **Framework**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + bcryptjs
- **File Upload**: Multer + Sharp (image processing)
- **Validation**: Joi + express-validator
- **Telegram**: Direct Bot API integration
- **Email**: Nodemailer
- **SMS**: Twilio
- **Excel**: ExcelJS
- **Security**: Helmet, CORS, Rate Limiting

## 📁 Project Structure

```
backend/
├── server.js                 # Main application entry
├── middleware/               # Custom middleware
│   ├── auth.js              # Authentication middleware
│   ├── validation.js        # Input validation
│   ├── upload.js            # File upload handling
│   └── errorHandler.js      # Error handling
├── models/                  # Mongoose models
│   ├── User.js              # User model
│   ├── LoginRecord.js       # Login tracking
│   ├── Link.js              # URL management
│   ├── IPRecord.js          # IP management
│   ├── Contestant.js        # Contest participants
│   ├── Image.js             # File management
│   ├── TelegramConfig.js    # Telegram settings
│   └── ...                  # Other models
├── controllers/             # Business logic
│   ├── authController.js    # Authentication
│   ├── loginRecordController.js
│   ├── telegramController.js
│   └── ...                  # Other controllers
├── routes/                  # API routes
│   ├── auth.js              # Auth endpoints
│   ├── loginRecords.js      # Login management
│   ├── telegram.js          # Telegram integration
│   └── ...                  # Other routes
├── services/                # External services
│   ├── telegramService.js   # Telegram API
│   └── notificationService.js # Email/SMS
├── uploads/                 # File storage
└── demo.js                  # Sample data & testing
```

## 🚦 Getting Started

### Prerequisites
- Node.js 16+ 
- MongoDB 5+
- npm or yarn

### Installation

1. **Clone and install**
```bash
git clone <repository-url>
cd admin-dashboard-backend
npm install
```

2. **Environment setup**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start MongoDB**
```bash
# Using MongoDB locally
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:5
```

4. **Run the application**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

5. **Seed sample data**
```bash
npm run seed
```

6. **Run tests**
```bash
npm test
```

## 🔧 Configuration

### Environment Variables

Key environment variables you need to set:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/admin_dashboard

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Telegram Bot
TELEGRAM_BOT_TOKEN=your-bot-token-from-botfather
TELEGRAM_CHAT_ID=@your-channel-or-chat-id

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Twilio SMS (Optional)
TWILIO_SID=your-twilio-sid
TWILIO_TOKEN=your-twilio-token
```

### Telegram Setup

1. **Create a bot**: Message @BotFather on Telegram
2. **Get bot token**: Save the token from BotFather
3. **Get chat ID**: 
   - Add your bot to a channel/group
   - Send a message to the bot
   - Visit `https://api.telegram.org/bot<TOKEN>/getUpdates`
   - Find the chat ID in the response

## 📝 API Documentation

### Authentication
```
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/profile
PUT  /api/auth/profile
POST /api/auth/logout
```

### Login Records
```
GET    /api/login-records
POST   /api/login-records
PUT    /api/login-records/:id
DELETE /api/login-records/:id
POST   /api/login-records/:id/send-notification
POST   /api/login-records/:id/send-telegram
POST   /api/login-records/bulk/send-notifications
POST   /api/login-records/bulk/send-telegram
```

### Telegram Integration
```
GET  /api/telegram/config
PUT  /api/telegram/config
POST /api/telegram/test-connection
POST /api/telegram/send-test
GET  /api/telegram/statistics
```

### Other Endpoints
- **Links**: `/api/links`
- **IPs**: `/api/ips`
- **Access**: `/api/access`
- **Images**: `/api/images`
- **Contestants**: `/api/contestants`
- **Content**: `/api/content`
- **Activity**: `/api/activity`

## 🔐 Authentication & Authorization

### User Roles

1. **Super Admin**
   - All permissions
   - User management
   - System settings

2. **Manager** 
   - Read, write, approve
   - Manage contestants
   - View reports

3. **Editor**
   - Read, write
   - Edit articles
   - Manage images

### Permission System

The system uses granular permissions:
- `read` - View data
- `write` - Create/edit data  
- `approve` - Approve/reject items
- `delete` - Delete data
- `manage_users` - User management
- `system_settings` - System configuration

## 📨 Telegram Integration

### Features
- ✅ Auto-send login notifications
- ✅ Bulk message sending
- ✅ Customizable message templates
- ✅ Connection testing
- ✅ Statistics tracking

### Message Template Variables

For login notifications:
- `{{contestName}}` - Contest name
- `{{username}}` - User login
- `{{password}}` - Password (configurable)
- `{{otpCode}}` - OTP code
- `{{timestamp}}` - Login time
- `{{ipAddress}}` - IP address
- `{{device}}` - Device info
- `{{location}}` - Location (if available)
- `{{status}}` - Login status
- `{{statusIcon}}` - Status emoji

## 🧪 Testing

### Run Tests
```bash
# Run all API tests
npm test

# Run specific test suites
node demo.js test

# Test with sample data
node demo.js seed
```

### Test Coverage
- Authentication flows
- CRUD operations
- Telegram integration
- File upload
- Bulk operations
- Error handling

## 📊 Monitoring

### Activity Logs
All actions are logged with:
- User identification
- IP address
- Action performed
- Entity affected
- Timestamp
- Result (success/failure)

### Statistics
- Login attempt tracking
- Link click analytics
- Image upload metrics
- Telegram message stats
- User activity patterns

## 🚀 Deployment

### Production Setup

1. **Environment**
```bash
NODE_ENV=production
PORT=80
```

2. **Database**
- Use MongoDB Atlas or dedicated server
- Enable authentication
- Set up backups

3. **Security**
- Enable HTTPS
- Set strong JWT secret
- Configure firewall
- Use environment-specific configs

4. **Process Management**
```bash
# Using PM2
npm install -g pm2
pm2 start server.js --name admin-api
pm2 startup
pm2 save
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Review existing issues
3. Create a new issue with details

## 🔄 Version History

### v1.0.0
- ✅ Complete authentication system
- ✅ Login records management
- ✅ Telegram integration
- ✅ Image management
- ✅ Contestant management
- ✅ Content management
- ✅ Activity logging
- ✅ Role-based permissions

---

**Happy Coding! 🎉**
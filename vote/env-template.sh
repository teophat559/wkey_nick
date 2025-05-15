# Environment Configuration Template
# Copy this file to .env and fill in your actual values

# Application
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/admin_dashboard

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your-telegram-bot-token-from-botfather
TELEGRAM_CHAT_ID=@your-telegram-channel-or-chat-id

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@yourdomain.com

# Twilio Configuration (SMS)
TWILIO_SID=your-twilio-account-sid
TWILIO_TOKEN=your-twilio-auth-token
TWILIO_PHONE=+1234567890

# OAuth Configuration
# Facebook
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret

# Google
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# File Upload
MAX_FILE_SIZE=50MB
UPLOAD_DIR=uploads

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=5

# Security
BCRYPT_ROUNDS=10
SESSION_TIMEOUT=24h
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Redis (if using for caching)
REDIS_URL=redis://localhost:6379

# AWS S3 (if using for file storage)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name
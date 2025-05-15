import React, { useState, useEffect } from 'react';
import { 
  Lock, Link, Shield, Users, ImageIcon, UserCheck, FileText, 
  Calendar, Settings, LogOut, Menu, Search, Bell, User,
  Plus, Edit, Trash2, Eye, Filter, Download, Upload,
  ChevronRight, Home, X, Check, AlertTriangle, Clock,
  RotateCcw, Send, ExternalLink, Activity, BarChart3,
  Crop, Folder, Globe, MessageCircle, Monitor, Smartphone,
  Facebook, Mail, Bot, Crown, ShieldCheck, Save, Copy
} from 'lucide-react';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('login');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [telegramConnected, setTelegramConnected] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  
  // Show toast notification
  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
  
  // Simulate auto-sending to Telegram when new login detected
  useEffect(() => {
    if (telegramConnected && activeMenu === 'login') {
      // Simulate periodic checking for new logins
      const interval = setInterval(() => {
        // In real app, this would check for new login records
        console.log('Checking for new logins to send to Telegram...');
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [telegramConnected, activeMenu]);

  // Toast Component
  const Toast = () => {
    if (!showToast) return null;
    
    return (
      <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
        <div className="flex items-center gap-2">
          <Check size={16} />
          <span>{toastMessage}</span>
        </div>
      </div>
    );
  };

  // Sample data
  const sampleAuthRecords = [
    { id: 1, link: 'Cuộc thi Miss Universe Vietnam 2024', username: 'thisinh001', password: 'pass123', otpCode: '123456', timestamp: '2024-03-15 14:30', ip: '192.168.1.1', device: 'iPhone 15', status: 'success' },
    { id: 2, link: 'Cuộc thi The Voice Việt Nam', username: 'singer2024', password: 'voice123', otpCode: '789012', timestamp: '2024-03-15 13:15', ip: '192.168.1.2', device: 'Samsung Galaxy', status: 'failed' },
    { id: 3, link: 'Vietnam Idol 2024', username: 'idol_fan', password: 'idol2024', otpCode: '345678', timestamp: '2024-03-15 12:00', ip: '192.168.1.3', device: 'MacBook Pro', status: 'pending' }
  ];

  const sampleLinks = [
    { id: 1, title: 'Link đăng ký Miss Universe Vietnam', url: 'https://missuni.vn/register', category: 'Cuộc thi sắc đẹp', clicks: 1250, created: '2024-03-10', status: 'active' },
    { id: 2, title: 'The Voice - Gửi bài dự thi', url: 'https://thevoice.vn/submit', category: 'Cuộc thi âm nhạc', clicks: 890, created: '2024-03-08', status: 'inactive' },
    { id: 3, title: 'Vietnam Idol Online Audition', url: 'https://vietnamidol.com/audition', category: 'Cuộc thi âm nhạc', clicks: 567, created: '2024-03-05', status: 'scheduled' }
  ];

  const sampleIPs = [
    { id: 1, ip: '192.168.1.100', user: 'thisinh001', timestamp: '2024-03-15 14:30', location: 'Hà Nội, Việt Nam', device: 'Chrome/Mac', status: 'allowed' },
    { id: 2, ip: '203.113.185.45', user: 'singer2024', timestamp: '2024-03-15 13:15', location: 'TP.HCM, Việt Nam', device: 'Safari/iPhone', status: 'blocked' },
    { id: 3, ip: '171.244.130.22', user: 'idol_fan', timestamp: '2024-03-15 12:00', location: 'Đà Nẵng, Việt Nam', device: 'Firefox/Windows', status: 'suspicious' }
  ];

  const sampleImages = [
    { id: 1, name: 'avatar_001.jpg', category: 'avatar', size: '2.5MB', uploadDate: '2024-03-15', url: '/api/placeholder/150/150' },
    { id: 2, name: 'contestant_miss_vn.jpg', category: 'contestant', size: '4.1MB', uploadDate: '2024-03-14', url: '/api/placeholder/150/200' },
    { id: 3, name: 'banner_thevoice.png', category: 'banner', size: '1.8MB', uploadDate: '2024-03-13', url: '/api/placeholder/300/100' },
    { id: 4, name: 'product_logo.svg', category: 'product', size: '256KB', uploadDate: '2024-03-12', url: '/api/placeholder/150/150' }
  ];

  const sampleContestants = [
    { id: 1, avatar: '/api/placeholder/50/50', name: 'Nguyễn Thu Hà', number: 'SBD001', contest: 'Miss Universe Vietnam 2024', status: 'active', phone: '0901234567', email: 'thuha@email.com' },
    { id: 2, avatar: '/api/placeholder/50/50', name: 'Trần Minh Anh', number: 'SBD002', contest: 'The Voice Việt Nam', status: 'pending', phone: '0907654321', email: 'minhanh@email.com' },
    { id: 3, avatar: '/api/placeholder/50/50', name: 'Lê Thị Bình', number: 'SBD003', contest: 'Vietnam Idol 2024', status: 'rejected', phone: '0912345678', email: 'thibinh@email.com' }
  ];

  const sampleNotifications = [
    { id: 1, type: 'toast', title: 'Thông báo nghỉ lễ 30/4', content: 'Hệ thống sẽ tạm ngưng...', status: 'active', schedule: null, created: '2024-03-15' },
    { id: 2, type: 'banner', title: 'Khuyến mãi tháng 4', content: 'Giảm giá 50% cho...', status: 'scheduled', schedule: '2024-04-01', created: '2024-03-14' },
    { id: 3, type: 'modal', title: 'Cập nhật chính sách', content: 'Chính sách mới có hiệu lực...', status: 'draft', schedule: null, created: '2024-03-13' }
  ];

  const sampleSystemNotifications = [
    { id: 1, type: 'User Login', target: 'Admin', time: '2024-03-15 14:30', status: 'success', message: 'Admin đăng nhập thành công' },
    { id: 2, type: 'Data Export', target: 'Manager', time: '2024-03-15 13:15', status: 'pending', message: 'Xuất báo cáo thí sinh' },
    { id: 3, type: 'System Error', target: 'System', time: '2024-03-15 12:00', status: 'error', message: 'Lỗi kết nối database' }
  ];

  const sampleActivityLogs = [
    { id: 1, icon: 'User', user: 'admin@system.com', action: 'Đăng nhập hệ thống', details: 'Truy cập từ IP 192.168.1.1', ip: '192.168.1.1', timestamp: '2024-03-15 14:30' },
    { id: 2, icon: 'Edit', user: 'manager@system.com', action: 'Cập nhật thông tin thí sinh', details: 'SBD001 - Nguyễn Thu Hà', ip: '192.168.1.2', timestamp: '2024-03-15 14:25' },
    { id: 3, icon: 'Trash2', user: 'editor@system.com', action: 'Xóa bài viết', details: 'ID: 123 - Thông báo cũ', ip: '192.168.1.3', timestamp: '2024-03-15 14:20' }
  ];

  const sampleUsers = [
    { id: 1, name: 'Super Admin', email: 'superadmin@system.com', role: 'superadmin', status: 'active', lastLogin: '2024-03-15 14:30', permissions: ['all'] },
    { id: 2, name: 'Manager', email: 'manager@system.com', role: 'manager', status: 'active', lastLogin: '2024-03-15 13:15', permissions: ['read', 'write', 'approve'] },
    { id: 3, name: 'Editor', email: 'editor@system.com', role: 'editor', status: 'active', lastLogin: '2024-03-15 12:00', permissions: ['read', 'write'] }
  ];

  const menuItems = [
    { id: 'login', label: 'Quản lý đăng nhập', icon: Lock },
    { id: 'links', label: 'Quản lý liên kết', icon: Link },
    { id: 'ip', label: 'Quản lý IP', icon: Shield },
    { id: 'access', label: 'Quyền truy cập', icon: Users },
    { id: 'images', label: 'Quản lý hình ảnh', icon: ImageIcon },
    { id: 'contestants', label: 'Quản lý thí sinh', icon: UserCheck },
    { id: 'content', label: 'Quản lý nội dung web', icon: FileText },
    { id: 'web-notifications', label: 'Quản lý thông báo web', icon: Bell },
    { id: 'system-notifications', label: 'Quản lý thông báo hệ thống', icon: MessageCircle },
    { id: 'activity', label: 'Lịch sử hoạt động', icon: Calendar },
    { id: 'settings', label: 'Cài đặt hệ thống', icon: Settings }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'success': case 'active': case 'allowed': return 'text-green-500 bg-green-50';
      case 'failed': case 'error': case 'blocked': case 'rejected': return 'text-red-500 bg-red-50';
      case 'pending': case 'suspicious': return 'text-yellow-500 bg-yellow-50';
      case 'inactive': case 'scheduled': case 'draft': return 'text-gray-500 bg-gray-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'success': 'Thành công',
      'failed': 'Thất bại', 
      'pending': 'Chờ xử lý',
      'active': 'Hoạt động',
      'inactive': 'Không hoạt động',
      'scheduled': 'Đã lên lịch',
      'allowed': 'Được phép',
      'blocked': 'Bị chặn',
      'suspicious': 'Đang nghi ngờ',
      'draft': 'Bản nháp',
      'rejected': 'Bị từ chối',
      'error': 'Lỗi'
    };
    return statusMap[status] || status;
  };

  const openModal = (type, data = null) => {
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
  };

  // Login Management Page
  const LoginManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý đăng nhập</h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => openModal('telegram-config')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Bot size={20} /> Cấu hình Telegram
          </button>
          <button 
            onClick={() => openModal('add-auth')}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
          >
            <Plus size={20} /> Thêm mới
          </button>
        </div>
      </div>

      {/* Telegram Status Card */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Bot className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Telegram Bot Status</h3>
              <p className="text-blue-700 text-sm">Auto-send login notifications to Telegram</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-blue-600">Connected Channel:</div>
              <div className="font-mono text-sm text-blue-800">@admin_notifications</div>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-700 font-medium">Connected</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="success">Thành công</option>
              <option value="failed">Thất bại</option>
              <option value="pending">Chờ xử lý</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button className="border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Download size={16} /> Xuất Excel
            </button>
            {selectedItems.length > 0 && (
              <>
                <button 
                  onClick={() => openModal('bulk-telegram')}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Bot size={16} /> Gửi Telegram ({selectedItems.length})
                </button>
                <button 
                  onClick={() => openModal('bulk-notification')}
                  className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
                >
                  <Send size={16} /> Gửi thông báo ({selectedItems.length})
                </button>
                <button className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 flex items-center gap-2">
                  <Trash2 size={16} /> Xóa đã chọn ({selectedItems.length})
                </button>
              </>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 text-left">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="p-3 text-left">Tên link</th>
                <th className="p-3 text-left">Username</th>
                <th className="p-3 text-left">Password</th>
                <th className="p-3 text-left">OTP Code</th>
                <th className="p-3 text-left">Thời gian</th>
                <th className="p-3 text-left">IP/Device</th>
                <th className="p-3 text-left">Trạng thái</th>
                <th className="p-3 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {sampleAuthRecords.map(record => (
                <tr key={record.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="p-3 font-medium">{record.link}</td>
                  <td className="p-3">{record.username}</td>
                  <td className="p-3 font-mono text-sm">{record.password}</td>
                  <td className="p-3 font-mono">{record.otpCode}</td>
                  <td className="p-3 text-sm text-gray-600">{record.timestamp}</td>
                  <td className="p-3">
                    <div className="text-sm">
                      <div>{record.ip}</div>
                      <div className="text-gray-500">{record.device}</div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                      {getStatusText(record.status)}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button className="text-blue-500 hover:bg-blue-50 p-1 rounded" title="Xem chi tiết">
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => openModal('send-notification', record)}
                        className="text-green-500 hover:bg-green-50 p-1 rounded" 
                        title="Gửi thông báo"
                      >
                        <Send size={16} />
                      </button>
                      <button 
                        onClick={() => openModal('send-telegram', record)}
                        className="text-blue-600 hover:bg-blue-50 p-1 rounded" 
                        title="Gửi qua Telegram"
                      >
                        <MessageCircle size={16} />
                      </button>
                      <button className="text-red-500 hover:bg-red-50 p-1 rounded" title="Xóa">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Hiển thị 1-3 của 3 bản ghi
          </div>
          <div className="flex items-center gap-2">
            <button className="border border-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-50">
              Trước
            </button>
            <button className="bg-blue-500 text-white px-3 py-1 rounded">1</button>
            <button className="border border-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-50">
              Tiếp
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Links Management Page
  const LinksManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý liên kết</h1>
        <button 
          onClick={() => openModal('add-link')}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
        >
          <Plus size={20} /> Thêm link mới
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Tìm kiếm links..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Tất cả danh mục</option>
              <option value="beauty">Cuộc thi sắc đẹp</option>
              <option value="music">Cuộc thi âm nhạc</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2">
              <Check size={16} /> Kích hoạt tất cả
            </button>
            <button className="bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600 flex items-center gap-2">
              <Clock size={16} /> Hủy kích hoạt
            </button>
            <button className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 flex items-center gap-2">
              <Trash2 size={16} /> Xóa tất cả
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 text-left">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="p-3 text-left">Tiêu đề</th>
                <th className="p-3 text-left">URL</th>
                <th className="p-3 text-left">Danh mục</th>
                <th className="p-3 text-left">Lượt click</th>
                <th className="p-3 text-left">Ngày tạo</th>
                <th className="p-3 text-left">Trạng thái</th>
                <th className="p-3 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {sampleLinks.map(link => (
                <tr key={link.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="p-3 font-medium">{link.title}</td>
                  <td className="p-3">
                    <a href={link.url} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                      {link.url}
                    </a>
                  </td>
                  <td className="p-3">{link.category}</td>
                  <td className="p-3 font-bold text-blue-600">{link.clicks.toLocaleString()}</td>
                  <td className="p-3 text-sm text-gray-600">{link.created}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(link.status)}`}>
                      {getStatusText(link.status)}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button className="text-blue-500 hover:bg-blue-50 p-1 rounded">
                        <Edit size={16} />
                      </button>
                      <button className="text-green-500 hover:bg-green-50 p-1 rounded">
                        <ExternalLink size={16} />
                      </button>
                      <button className="text-red-500 hover:bg-red-50 p-1 rounded">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // IP Management Page
  const IPManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý IP</h1>
        <button 
          onClick={() => openModal('block-ip')}
          className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-600"
        >
          <Shield size={20} /> Chặn IP
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Tìm kiếm IP..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Tất cả trạng thái</option>
              <option value="allowed">Được phép</option>
              <option value="blocked">Bị chặn</option>
              <option value="suspicious">Đang nghi ngờ</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 text-left">IP Address</th>
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Thời gian</th>
                <th className="p-3 text-left">Vị trí</th>
                <th className="p-3 text-left">Device</th>
                <th className="p-3 text-left">Trạng thái</th>
                <th className="p-3 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {sampleIPs.map(ip => (
                <tr key={ip.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono font-medium">{ip.ip}</td>
                  <td className="p-3">{ip.user}</td>
                  <td className="p-3 text-sm text-gray-600">{ip.timestamp}</td>
                  <td className="p-3">{ip.location}</td>
                  <td className="p-3 text-sm">{ip.device}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ip.status)}`}>
                      {getStatusText(ip.status)}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {ip.status === 'blocked' ? (
                        <button className="text-green-500 hover:bg-green-50 px-2 py-1 rounded text-sm">
                          Bỏ chặn
                        </button>
                      ) : (
                        <button className="text-red-500 hover:bg-red-50 px-2 py-1 rounded text-sm">
                          Chặn
                        </button>
                      )}
                      <button className="text-blue-500 hover:bg-blue-50 p-1 rounded">
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Access Management Page
  const AccessManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quyền truy cập</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Facebook className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Facebook Login</h3>
              <p className="text-gray-600">Đăng nhập bằng tài khoản Facebook</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Trạng thái:</span>
              <span className="text-green-600 font-medium">Hoạt động</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">App ID:</span>
              <span className="font-mono text-xs">1234567890123456</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Callback URL:</span>
              <span className="text-blue-600 text-xs">https://app.com/auth/fb</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phạm vi quyền:</span>
              <span className="text-xs">email, public_profile</span>
            </div>
          </div>
          <button 
            onClick={() => openModal('config-facebook')}
            className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            Cấu hình
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Mail className="text-red-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Gmail Login</h3>
              <p className="text-gray-600">Đăng nhập bằng tài khoản Google</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Trạng thái:</span>
              <span className="text-green-600 font-medium">Hoạt động</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Client ID:</span>
              <span className="font-mono text-xs">abcd-1234.apps.google.com</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Callback URL:</span>
              <span className="text-blue-600 text-xs">https://app.com/auth/google</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phạm vi quyền:</span>
              <span className="text-xs">email, profile, openid</span>
            </div>
          </div>
          <button 
            onClick={() => openModal('config-google')}
            className="w-full mt-4 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
          >
            Cấu hình
          </button>
        </div>
      </div>
    </div>
  );

  // Image Management Page
  const ImageManagement = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [dragOver, setDragOver] = useState(false);

    const filteredImages = selectedCategory === 'all' 
      ? sampleImages 
      : sampleImages.filter(img => img.category === selectedCategory);

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý hình ảnh</h1>
          <button 
            onClick={() => openModal('upload-images')}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
          >
            <Upload size={20} /> Upload ảnh
          </button>
        </div>

        <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow">
          <span className="text-gray-700">Danh mục:</span>
          {['all', 'avatar', 'contestant', 'banner', 'product'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-lg text-sm ${
                selectedCategory === category 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'Tất cả' : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Tìm kiếm ảnh..."
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            {selectedItems.length > 0 && (
              <div className="flex items-center gap-2">
                <button className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2">
                  <Folder size={16} /> Tạo thư mục
                </button>
                <button className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 flex items-center gap-2">
                  <Trash2 size={16} /> Xóa đã chọn ({selectedItems.length})
                </button>
              </div>
            )}
          </div>

          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors ${
              dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
          >
            <Upload className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600 mb-2">Kéo thả ảnh vào đây hoặc</p>
            <button 
              onClick={() => openModal('upload-images')}
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              Chọn tệp
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredImages.map(image => (
              <div key={image.id} className="group relative border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square relative">
                  <img 
                    src={image.url} 
                    alt={image.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button className="text-white bg-blue-500 p-2 rounded hover:bg-blue-600">
                      <Eye size={16} />
                    </button>
                    <button className="text-white bg-green-500 p-2 rounded hover:bg-green-600">
                      <Edit size={16} />
                    </button>
                    <button className="text-white bg-red-500 p-2 rounded hover:bg-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="absolute top-2 left-2">
                    <input type="checkbox" className="rounded" />
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium truncate">{image.name}</p>
                  <p className="text-xs text-gray-500">
                    {image.size} • {image.uploadDate}
                  </p>
                  <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-xs rounded">
                    {image.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Contestants Management Page
  const ContestantsManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý thí sinh</h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => openModal('import-contestants')}
            className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600"
          >
            <Upload size={20} /> Import Excel
          </button>
          <button 
            onClick={() => openModal('add-contestant')}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
          >
            <Plus size={20} /> Thêm thí sinh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Tìm kiếm thí sinh..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Tất cả cuộc thi</option>
              <option value="miss-vn">Miss Universe Vietnam</option>
              <option value="the-voice">The Voice Việt Nam</option>
              <option value="vietnam-idol">Vietnam Idol</option>
            </select>
            <select className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="pending">Chờ duyệt</option>
              <option value="rejected">Bị từ chối</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button className="border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Download size={16} /> Xuất Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 text-left">Avatar</th>
                <th className="p-3 text-left">Họ tên</th>
                <th className="p-3 text-left">Số báo danh</th>
                <th className="p-3 text-left">Cuộc thi</th>
                <th className="p-3 text-left">Thông tin liên hệ</th>
                <th className="p-3 text-left">Trạng thái</th>
                <th className="p-3 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {sampleContestants.map(contestant => (
                <tr key={contestant.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <img 
                      src={contestant.avatar} 
                      alt={contestant.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </td>
                  <td className="p-3 font-medium">{contestant.name}</td>
                  <td className="p-3 font-bold text-blue-600">{contestant.number}</td>
                  <td className="p-3">{contestant.contest}</td>
                  <td className="p-3">
                    <div className="text-sm">
                      <div>{contestant.phone}</div>
                      <div className="text-gray-500">{contestant.email}</div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contestant.status)}`}>
                      {getStatusText(contestant.status)}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button className="text-blue-500 hover:bg-blue-50 p-1 rounded">
                        <Eye size={16} />
                      </button>
                      <button className="text-green-500 hover:bg-green-50 p-1 rounded">
                        <Edit size={16} />
                      </button>
                      <button className="text-red-500 hover:bg-red-50 p-1 rounded">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Content Management Page
  const ContentManagement = () => {
    const [contentTab, setContentTab] = useState('articles');

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý nội dung web</h1>
          <button 
            onClick={() => openModal(`add-${contentTab.slice(0, -1)}`)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
          >
            <Plus size={20} /> Thêm mới
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <nav className="flex">
              {[
                { id: 'articles', label: 'Bài viết' },
                { id: 'banners', label: 'Banner' },
                { id: 'blocks', label: 'Blocks' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setContentTab(tab.id)}
                  className={`px-6 py-3 border-b-2 font-medium ${
                    contentTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {contentTab === 'articles' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Tìm kiếm bài viết..."
                      className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <select className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="all">Tất cả danh mục</option>
                    <option value="news">Tin tức</option>
                    <option value="announcements">Thông báo</option>
                  </select>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map(item => (
                    <div key={item} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold mb-1">Thông báo cuộc thi Miss Universe Vietnam 2024</h3>
                          <p className="text-gray-600 text-sm mb-2">
                            Cuộc thi Miss Universe Vietnam 2024 chính thức khởi động với nhiều thay đổi mới...
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Danh mục: Tin tức</span>
                            <span>Tác giả: Admin</span>
                            <span>Ngày tạo: 2024-03-15</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="text-blue-500 hover:bg-blue-50 p-1 rounded">
                            <Eye size={16} />
                          </button>
                          <button className="text-green-500 hover:bg-green-50 p-1 rounded">
                            <Edit size={16} />
                          </button>
                          <button className="text-red-500 hover:bg-red-50 p-1 rounded">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {contentTab === 'banners' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map(item => (
                    <div key={item} className="border rounded-lg p-4">
                      <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                        <img src="/api/placeholder/300/150" alt="Banner" className="rounded" />
                      </div>
                      <h3 className="font-semibold mb-1">Banner trang chủ cuộc thi</h3>
                      <p className="text-gray-600 text-sm mb-2">Vị trí: Header • Kích thước: 1200x400</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Cập nhật: 2024-03-15</span>
                        <div className="flex items-center gap-2">
                          <button className="text-blue-500 hover:bg-blue-50 p-1 rounded">
                            <Edit size={16} />
                          </button>
                          <button className="text-red-500 hover:bg-red-50 p-1 rounded">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {contentTab === 'blocks' && (
              <div className="space-y-4">
                {['Giới thiệu', 'Footer', 'Liên hệ'].map(block => (
                  <div key={block} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold mb-1">Block {block}</h3>
                        <p className="text-gray-600 text-sm mb-2">
                          Nội dung block {block.toLowerCase()} hiển thị trên trang web
                        </p>
                        <span className="text-xs text-gray-500">Cập nhật: 2024-03-15</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="text-blue-500 hover:bg-blue-50 p-1 rounded">
                          <Eye size={16} />
                        </button>
                        <button className="text-green-500 hover:bg-green-50 p-1 rounded">
                          <Edit size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Web Notifications Management Page  
  const WebNotificationsManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý thông báo web</h1>
        <button 
          onClick={() => openModal('add-web-notification')}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
        >
          <Plus size={20} /> Tạo thông báo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-2">Toast</h3>
          <div className="bg-blue-100 border border-blue-300 rounded p-2 text-sm text-blue-800">
            <strong>Thông báo!</strong><br />
            Đây là preview toast notification
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-2">Banner</h3>
          <div className="bg-yellow-100 border border-yellow-300 rounded p-2 text-sm text-yellow-800 text-center">
            Banner thông báo hiển thị ở đầu trang
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-2">Modal</h3>
          <div className="border-2 border-gray-300 rounded p-3 text-center text-sm">
            <div className="font-semibold mb-1">Tiêu đề Modal</div>
            <div className="text-gray-600">Nội dung modal popup</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-2">Slide-in</h3>
          <div className="bg-green-100 border border-green-300 rounded p-2 text-sm text-green-800">
            Slide-in từ góc màn hình
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'active', label: 'Đang hiển thị' },
              { id: 'scheduled', label: 'Lên lịch' },
              { id: 'draft', label: 'Bản nháp' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 border-b-2 font-medium ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-3 text-left">Loại</th>
                  <th className="p-3 text-left">Tiêu đề</th>
                  <th className="p-3 text-left">Nội dung</th>
                  <th className="p-3 text-left">Trạng thái</th>
                  <th className="p-3 text-left">Lịch hiển thị</th>
                  <th className="p-3 text-left">Ngày tạo</th>
                  <th className="p-3 text-left">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {sampleNotifications.map(notification => (
                  <tr key={notification.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        notification.type === 'toast' ? 'bg-blue-100 text-blue-800' :
                        notification.type === 'banner' ? 'bg-yellow-100 text-yellow-800' :
                        notification.type === 'modal' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                      </span>
                    </td>
                    <td className="p-3 font-medium">{notification.title}</td>
                    <td className="p-3 text-sm text-gray-600 max-w-xs truncate">{notification.content}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                        {getStatusText(notification.status)}
                      </span>
                    </td>
                    <td className="p-3 text-sm">{notification.schedule || '-'}</td>
                    <td className="p-3 text-sm text-gray-600">{notification.created}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button className="text-blue-500 hover:bg-blue-50 p-1 rounded">
                          <Eye size={16} />
                        </button>
                        <button className="text-green-500 hover:bg-green-50 p-1 rounded">
                          <Edit size={16} />
                        </button>
                        <button className="text-red-500 hover:bg-red-50 p-1 rounded">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-2">Thống kê hiệu quả</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tổng lượt hiển thị:</span>
              <span className="font-semibold">12,345</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tổng lượt click:</span>
              <span className="font-semibold">1,234</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tỷ lệ CTR:</span>
              <span className="font-semibold text-green-600">10%</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-2">Loại phổ biến</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Toast:</span>
              <span className="font-semibold">45%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Banner:</span>
              <span className="font-semibold">30%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Modal:</span>
              <span className="font-semibold">25%</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-2">Hiệu quả theo thời gian</h3>
          <div className="h-20 bg-gray-100 rounded flex items-center justify-center text-gray-500 text-sm">
            Chart placeholder
          </div>
        </div>
      </div>
    </div>
  );

  // System Notifications Management Page
  const SystemNotificationsManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý thông báo hệ thống</h1>
        <button 
          onClick={() => openModal('add-system-notification')}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
        >
          <Plus size={20} /> Tạo thông báo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Tổng thông báo</h3>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bell className="text-blue-600" size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-2">156</p>
          <p className="text-gray-600 text-sm">Tăng 12% so với tháng trước</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Đã đọc</h3>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Check className="text-green-600" size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-2">142</p>
          <p className="text-gray-600 text-sm">Tỷ lệ đọc: 91%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Chờ xử lý</h3>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="text-yellow-600" size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-yellow-600 mt-2">14</p>
          <p className="text-gray-600 text-sm">Cần xem xét ngay</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Tìm kiếm thông báo..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Tất cả loại</option>
              <option value="login">User Login</option>
              <option value="export">Data Export</option>
              <option value="error">System Error</option>
            </select>
            <select className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Tất cả trạng thái</option>
              <option value="success">Thành công</option>
              <option value="pending">Chờ xử lý</option>
              <option value="error">Lỗi</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 text-left">Loại</th>
                <th className="p-3 text-left">Đối tượng</th>
                <th className="p-3 text-left">Thông báo</th>
                <th className="p-3 text-left">Thời gian</th>
                <th className="p-3 text-left">Trạng thái</th>
                <th className="p-3 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {sampleSystemNotifications.map(notification => (
                <tr key={notification.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      notification.type === 'User Login' ? 'bg-blue-100 text-blue-800' :
                      notification.type === 'Data Export' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {notification.type}
                    </span>
                  </td>
                  <td className="p-3">{notification.target}</td>
                  <td className="p-3 text-sm">{notification.message}</td>
                  <td className="p-3 text-sm text-gray-600">{notification.time}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                      {getStatusText(notification.status)}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button className="text-blue-500 hover:bg-blue-50 p-1 rounded">
                        <Eye size={16} />
                      </button>
                      <button className="text-green-500 hover:bg-green-50 p-1 rounded">
                        <Check size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Cài đặt thông báo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Thông báo Email</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Thông báo đăng nhập</span>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Cảnh báo bảo mật</span>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Thông báo lỗi hệ thống</span>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
                </button>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-3">Thông báo Telegram</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Hoạt động người dùng</span>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Báo cáo hàng ngày</span>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Cảnh báo khẩn cấp</span>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Activity Log Page
  const ActivityLog = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Lịch sử hoạt động</h1>
        <button 
          onClick={() => openModal('export-logs')}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
        >
          <Download size={20} /> Xuất báo cáo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Hoạt động hôm nay</h3>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="text-blue-600" size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-2">156</p>
          <p className="text-gray-600 text-sm">Tăng 12% so với hôm qua</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Đăng nhập</h3>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <User className="text-green-600" size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-2">45</p>
          <p className="text-gray-600 text-sm">Người dùng duy nhất</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Chỉnh sửa</h3>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Edit className="text-yellow-600" size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-yellow-600 mt-2">89</p>
          <p className="text-gray-600 text-sm">Lần cập nhật dữ liệu</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Xóa</h3>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Trash2 className="text-red-600" size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-600 mt-2">22</p>
          <p className="text-gray-600 text-sm">Bản ghi bị xóa</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Tìm kiếm hoạt động..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Tất cả hoạt động</option>
              <option value="login">Đăng nhập</option>
              <option value="edit">Chỉnh sửa</option>
              <option value="delete">Xóa</option>
              <option value="create">Tạo mới</option>
            </select>
            <input
              type="date"
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 text-left">Icon</th>
                <th className="p-3 text-left">Người dùng</th>
                <th className="p-3 text-left">Hoạt động</th>
                <th className="p-3 text-left">Chi tiết</th>
                <th className="p-3 text-left">IP Address</th>
                <th className="p-3 text-left">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {sampleActivityLogs.map(log => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      log.icon === 'User' ? 'bg-blue-100 text-blue-600' :
                      log.icon === 'Edit' ? 'bg-green-100 text-green-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {log.icon === 'User' && <User size={16} />}
                      {log.icon === 'Edit' && <Edit size={16} />}
                      {log.icon === 'Trash2' && <Trash2 size={16} />}
                    </div>
                  </td>
                  <td className="p-3 font-medium">{log.user}</td>
                  <td className="p-3">{log.action}</td>
                  <td className="p-3 text-sm text-gray-600">{log.details}</td>
                  <td className="p-3 font-mono text-sm">{log.ip}</td>
                  <td className="p-3 text-sm text-gray-600">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // System Settings Page
  const SystemSettings = () => {
    const [settingsTab, setSettingsTab] = useState('general');

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h1>
          <button 
            onClick={() => openModal('backup-system')}
            className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600"
          >
            <Save size={20} /> Lưu cài đặt
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <nav className="flex">
              {[
                { id: 'general', label: 'Thông tin chung' },
                { id: 'security', label: 'Bảo mật' },
                { id: 'users', label: 'Người dùng & Vai trò' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSettingsTab(tab.id)}
                  className={`px-6 py-3 border-b-2 font-medium ${
                    settingsTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {settingsTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Thông tin ứng dụng</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Tên ứng dụng</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        defaultValue="Admin Dashboard System"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Phiên bản</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        defaultValue="1.0.0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Mô tả</label>
                      <textarea
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        defaultValue="Hệ thống quản lý admin cho cuộc thi"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Logo</label>
                      <div className="border rounded-lg p-4 text-center">
                        <img src="/api/placeholder/100/100" alt="Logo" className="mx-auto mb-2" />
                        <button className="text-blue-500 hover:text-blue-600">Thay đổi logo</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Cấu hình Telegram Bot</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Bot Token</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Chat ID</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="-1001234567890"
                      />
                    </div>
                  </div>
                  <button className="mt-3 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2">
                    <Bot size={16} /> Test kết nối
                  </button>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Cài đặt khác</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Bảo trì hệ thống</h4>
                        <p className="text-sm text-gray-600">Kích hoạt chế độ bảo trì</p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Đăng ký mới</h4>
                        <p className="text-sm text-gray-600">Cho phép đăng ký tài khoản mới</p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Thông báo Telegram</h4>
                        <p className="text-sm text-gray-600">Gửi thông báo qua Telegram</p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {settingsTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Cài đặt bảo mật</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-600">Bắt buộc 2FA cho tất cả người dùng</p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Session Timeout</h4>
                        <p className="text-sm text-gray-600">Tự động đăng xuất sau thời gian nhàn rỗi</p>
                      </div>
                      <select className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="30">30 phút</option>
                        <option value="60">1 giờ</option>
                        <option value="120">2 giờ</option>
                        <option value="480">8 giờ</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Password Policy</h4>
                        <p className="text-sm text-gray-600">Yêu cầu mật khẩu mạnh</p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Whitelist IP</h3>
                  <div className="space-y-2">
                    <input
                      type="text"
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập IP address (vd: 192.168.1.1)"
                    />
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                      Thêm IP
                    </button>
                  </div>
                  <div className="mt-4 space-y-2">
                    {['192.168.1.0/24', '10.0.0.0/16'].map((ip, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="font-mono">{ip}</span>
                        <button className="text-red-500 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Backup & Recovery</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Automatic Backup</h4>
                      <p className="text-sm text-gray-600 mb-3">Tự động backup database hàng ngày</p>
                      <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                        Kích hoạt
                      </button>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Manual Backup</h4>
                      <p className="text-sm text-gray-600 mb-3">Tạo backup thủ công ngay</p>
                      <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                        Backup ngay
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {settingsTab === 'users' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Quản lý người dùng</h3>
                  <button 
                    onClick={() => openModal('add-user')}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
                  >
                    <Plus size={16} /> Thêm người dùng
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="p-3 text-left">Người dùng</th>
                        <th className="p-3 text-left">Email</th>
                        <th className="p-3 text-left">Vai trò</th>
                        <th className="p-3 text-left">Trạng thái</th>
                        <th className="p-3 text-left">Đăng nhập cuối</th>
                        <th className="p-3 text-left">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sampleUsers.map(user => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                {user.role === 'superadmin' ? (
                                  <Crown className="text-yellow-600" size={16} />
                                ) : (
                                  <User className="text-blue-600" size={16} />
                                )}
                              </div>
                              <span className="font-medium">{user.name}</span>
                            </div>
                          </td>
                          <td className="p-3">{user.email}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              user.role === 'superadmin' ? 'bg-yellow-100 text-yellow-800' :
                              user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role === 'superadmin' ? 'Super Admin' :
                               user.role === 'manager' ? 'Manager' : 'Editor'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                              {getStatusText(user.status)}
                            </span>
                          </td>
                          <td className="p-3 text-sm text-gray-600">{user.lastLogin}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => openModal('edit-permissions', user)}
                                className="text-blue-500 hover:bg-blue-50 p-1 rounded"
                              >
                                <ShieldCheck size={16} />
                              </button>
                              <button className="text-green-500 hover:bg-green-50 p-1 rounded">
                                <Edit size={16} />
                              </button>
                              {user.role !== 'superadmin' && (
                                <button className="text-red-500 hover:bg-red-50 p-1 rounded">
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Vai trò và quyền</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Crown className="text-yellow-600" size={20} />
                        <h4 className="font-medium">Super Admin</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Toàn quyền kiểm soát hệ thống</p>
                      <div className="text-xs text-gray-500">
                        • Tất cả quyền
                        • Quản lý người dùng
                        • Cài đặt hệ thống
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <ShieldCheck className="text-blue-600" size={20} />
                        <h4 className="font-medium">Manager</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Quản lý nội dung và người dùng</p>
                      <div className="text-xs text-gray-500">
                        • Đọc, ghi, phê duyệt
                        • Quản lý thí sinh
                        • Xem báo cáo
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <User className="text-gray-600" size={20} />
                        <h4 className="font-medium">Editor</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Chỉnh sửa nội dung cơ bản</p>
                      <div className="text-xs text-gray-500">
                        • Đọc, ghi
                        • Chỉnh sửa bài viết
                        • Quản lý hình ảnh
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Modal Component for all types
  const Modal = () => {
    if (!showModal) return null;

    const renderModalContent = () => {
      switch(modalType) {
        case 'add-auth':
          return (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Thêm bản ghi đăng nhập</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tên link</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tên cuộc thi..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Username</label>
                    <input
                      type="text"
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                      type="password"
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">OTP Code</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  >
                    Thêm mới
                  </button>
                </div>
              </form>
            </div>
          );

        case 'add-link':
          return (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Thêm link mới</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tiêu đề</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tiêu đề link..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">URL</label>
                  <input
                    type="url"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Danh mục</label>
                  <select className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Chọn danh mục</option>
                    <option value="beauty">Cuộc thi sắc đẹp</option>
                    <option value="music">Cuộc thi âm nhạc</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mô tả</label>
                  <textarea
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Nhập mô tả..."
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  >
                    Thêm link
                  </button>
                </div>
              </form>
            </div>
          );

        case 'block-ip':
          return (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Chặn IP Address</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">IP Address</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập IP address..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Lý do chặn</label>
                  <textarea
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Nhập lý do chặn IP..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Thời gian chặn</label>
                  <select className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="permanent">Vĩnh viễn</option>
                    <option value="24h">24 giờ</option>
                    <option value="7d">7 ngày</option>
                    <option value="30d">30 ngày</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                  >
                    Chặn IP
                  </button>
                </div>
              </form>
            </div>
          );

        case 'bulk-telegram':
          return (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Gửi thông tin hàng loạt qua Telegram</h2>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Sẽ gửi {selectedItems.length} bản ghi</h3>
                  <div className="text-sm text-blue-800">
                    Tất cả thông tin đăng nhập đã chọn sẽ được gửi đến Telegram channel
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Telegram Channel</label>
                  <select className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="@admin_notifications">@admin_notifications (Main Channel)</option>
                    <option value="@backup_channel">@backup_channel (Backup Channel)</option>
                    <option value="custom">Custom Channel...</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Định dạng tin nhắn</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="radio" name="format" value="detailed" className="mr-2" defaultChecked />
                      <span className="text-sm">Chi tiết đầy đủ (Username, Password, OTP)</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="format" value="summary" className="mr-2" />
                      <span className="text-sm">Tóm tắt (Chỉ trạng thái và thời gian)</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Bot size={16} />
                    Gửi hàng loạt
                  </button>
                </div>
              </div>
            </div>
          );

        case 'bulk-notification':
          return (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Gửi thông báo hàng loạt</h2>
              <form className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 mb-2">Sẽ gửi cho {selectedItems.length} người dùng</h3>
                  <div className="text-sm text-green-800">
                    Thông báo sẽ được gửi đến tất cả người dùng có bản ghi đăng nhập đã chọn
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Loại thông báo</label>
                  <select className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="security_alert">Cảnh báo bảo mật</option>
                    <option value="login_success">Xác nhận đăng nhập thành công</option>
                    <option value="account_update">Cập nhật thông tin tài khoản</option>
                    <option value="custom">Thông báo tùy chỉnh</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tiêu đề</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tiêu đề thông báo..."
                    defaultValue="Thông báo từ hệ thống"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Nội dung</label>
                  <textarea
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder="Nhập nội dung thông báo..."
                    defaultValue="Chúng tôi đã ghi nhận hoạt động đăng nhập từ tài khoản của bạn."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Phương thức gửi</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded mr-2" defaultChecked />
                      <span className="text-sm">Email</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded mr-2" defaultChecked />
                      <span className="text-sm">SMS</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded mr-2" />
                      <span className="text-sm">Push Notification</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
                  >
                    <Send size={16} />
                    Gửi thông báo
                  </button>
                </div>
              </form>
            </div>
          );

        case 'telegram-config':
          return (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Cấu hình Telegram Bot</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Bot Token</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                    defaultValue="5987654321:AAExampleBotTokenForLoginNotifications"
                  />
                  <p className="text-xs text-gray-500 mt-1">Nhận từ @BotFather trên Telegram</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Chat/Channel ID</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="@channel_name hoặc -1001234567890"
                    defaultValue="@admin_notifications"
                  />
                  <p className="text-xs text-gray-500 mt-1">Channel/Group để nhận thông báo đăng nhập</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tự động gửi</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded mr-2" defaultChecked />
                      <span className="text-sm">Đăng nhập thành công</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded mr-2" defaultChecked />
                      <span className="text-sm">Đăng nhập thất bại</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded mr-2" />
                      <span className="text-sm">OTP được tạo</span>
                    </label>
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <h4 className="font-medium text-yellow-800 mb-1">🔒 Bảo mật</h4>
                  <p className="text-sm text-yellow-700">Thông tin password sẽ được mã hóa khi gửi qua Telegram</p>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    className="border border-blue-300 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50"
                  >
                    Test Connection
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  >
                    Lưu cấu hình
                  </button>
                </div>
              </form>
            </div>
          );

        case 'send-notification':
          return (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Gửi thông báo cho người dùng</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Người nhận</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 bg-gray-100"
                    value="Thí sinh của cuộc thi"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Loại thông báo</label>
                  <select className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="success">Đăng nhập thành công</option>
                    <option value="failed">Đăng nhập thất bại</option>
                    <option value="security">Cảnh báo bảo mật</option>
                    <option value="custom">Tùy chỉnh</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tiêu đề</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tiêu đề thông báo..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nội dung</label>
                  <textarea
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder="Nhập nội dung thông báo..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="email" className="rounded" />
                  <label htmlFor="email" className="text-sm">Gửi qua Email</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="sms" className="rounded" defaultChecked />
                  <label htmlFor="sms" className="text-sm">Gửi qua SMS</label>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                  >
                    Gửi thông báo
                  </button>
                </div>
              </form>
            </div>
          );

        case 'send-telegram':
          return (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Gửi thông tin qua Telegram</h2>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Thông tin đăng nhập</h3>
                  <div className="text-sm text-blue-800 space-y-1">
                    <div><strong>Cuộc thi:</strong> {modalType === 'send-telegram' ? 'Miss Universe Vietnam 2024' : ''}</div>
                    <div><strong>Username:</strong> thisinh001</div>
                    <div><strong>Password:</strong> pass123</div>
                    <div><strong>OTP:</strong> 123456</div>
                    <div><strong>Thời gian:</strong> 2024-03-15 14:30</div>
                    <div><strong>IP:</strong> 192.168.1.1</div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Telegram Chat ID</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="@username hoặc -1001234567890"
                    defaultValue="@admin_channel"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mẫu tin nhắn</label>
                  <textarea
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="6"
                    defaultValue={`🔐 THÔNG TIN ĐĂNG NHẬP

📋 Cuộc thi: Miss Universe Vietnam 2024
👤 Username: thisinh001
🔑 Password: pass123  
🔐 OTP: 123456
⏰ Thời gian: 2024-03-15 14:30
🌐 IP: 192.168.1.1
📱 Device: iPhone 15
✅ Trạng thái: Thành công`}
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
                  >
                    <Bot size={16} />
                    Gửi Telegram
                  </button>
                </div>
              </div>
            </div>
          );
          return (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Modal Content</h2>
              <p>Nội dung modal cho {modalType}</p>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={closeModal}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Đóng
                </button>
              </div>
            </div>
          );
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold">Modal</h2>
            <button
              onClick={closeModal}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
          {renderModalContent()}
        </div>
      </div>
    );
  };

  // Render current page
  const renderCurrentPage = () => {
    switch(activeMenu) {
      case 'login':
        return <LoginManagement />;
      case 'links':
        return <LinksManagement />;
      case 'ip':
        return <IPManagement />;
      case 'access':
        return <AccessManagement />;
      case 'images':
        return <ImageManagement />;
      case 'contestants':
        return <ContestantsManagement />;
      case 'content':
        return <ContentManagement />;
      case 'web-notifications':
        return <WebNotificationsManagement />;
      case 'system-notifications':
        return <SystemNotificationsManagement />;
      case 'activity':
        return <ActivityLog />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <LoginManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300`}>
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Crown className="text-white" size={20} />
            </div>
            {sidebarOpen && (
              <span className="font-bold text-xl text-gray-800">Admin Panel</span>
            )}
          </div>
        </div>

        <nav className="mt-8">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 transition-colors ${
                  activeMenu === item.id ? 'bg-blue-50 border-r-4 border-blue-500 text-blue-600' : 'text-gray-600'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
          
          <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 text-red-600 mt-8">
            <LogOut size={20} />
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 hover:text-gray-800"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
            
            <button className="relative p-2 text-gray-600 hover:text-gray-800">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="flex items-center gap-3">
              <img
                src="/api/placeholder/32/32"
                alt="Avatar"
                className="w-8 h-8 rounded-full"
              />
              <span className="text-gray-700 font-medium">Admin</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {renderCurrentPage()}
        </main>
      </div>

      {/* Modal */}
      <Modal />
      
      {/* Toast Notification */}
      <Toast />
    </div>
  );
};

export default AdminDashboard;
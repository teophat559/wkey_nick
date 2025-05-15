import React, { useState, useEffect, useContext, createContext } from 'react';
import { 
  User, Lock, Eye, EyeOff, Camera, Heart, MessageCircle,
  Share2, Search, Menu, X, Home, Trophy, Image, Calendar, Bell,
  Settings, LogOut, ChevronRight, Star, ThumbsUp, Send, Edit,
  Facebook, Mail, ArrowRight, CheckCircle, AlertCircle,
  Upload, MapPin, Globe, Clock, Award, Users, Phone
} from 'lucide-react';

// API Configuration
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  ENDPOINTS: {
    // Auth endpoints
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
    CSRF: '/auth/csrf-token',
    
    // Social auth endpoints
    GOOGLE_AUTH: '/auth/google',
    FACEBOOK_AUTH: '/auth/facebook',
    
    // Content endpoints
    ARTICLES: '/content/articles',
    BANNERS: '/content/banners',
    CONTESTANTS: '/contestants',
    CONTESTS: '/contests',
    
    // User interaction endpoints
    COMMENTS: '/comments',
    VOTES: '/votes',
    FEEDBACK: '/feedback',
    
    // File upload
    UPLOAD: '/upload'
  }
};

// Auth Context
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef(null);
  const tokenExpiryRef = useRef(null);

  // Đặt token với xử lý tự động refresh
  const setAuthToken = (newToken, expiresIn = 3600) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem('token', newToken);
      
      // Lưu thời điểm hết hạn
      const expiryTime = Date.now() + expiresIn * 1000;
      tokenExpiryRef.current = expiryTime;
      
      // Đặt timer để refresh token trước khi hết hạn
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      
      // Refresh token 1 phút trước khi hết hạn
      const timeUntilRefresh = expiresIn * 1000 - 60000;
      if (timeUntilRefresh > 0) {
        refreshTimerRef.current = setTimeout(refreshToken, timeUntilRefresh);
      }
    } else {
      localStorage.removeItem('token');
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    }
  };

  useEffect(() => {
    if (token) {
      // Verify token and get user info
      fetchUserProfile();
    } else {
      setLoading(false);
    }
    
    // Cleanup on unmount
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [token]);

  const refreshToken = async () => {
    try {
      const result = await ApiService.post(API_CONFIG.ENDPOINTS.REFRESH, {}, false, {
        useCache: false
      });
      
      if (result.token) {
        setAuthToken(result.token, result.expiresIn || 3600);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Only logout if the error is not network related, to prevent
      // unnecessary logouts during temporary network issues
      if (error.message !== 'Network error') {
        logout();
      } else {
        // Try again in 30 seconds if it was a network error
        refreshTimerRef.current = setTimeout(refreshToken, 30000);
      }
    }
  };

  const fetchUserProfile = async () => {
    try {
      const userData = await ApiService.get(API_CONFIG.ENDPOINTS.PROFILE, true, {
        useCache: false // Always get fresh user data
      });
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // Add security fingerprint
      const fingerprint = await generateBrowserFingerprint();
      
      const result = await ApiService.post(API_CONFIG.ENDPOINTS.LOGIN, {
        email, 
        password,
        fingerprint
      });
      
      if (result.success) {
        setAuthToken(result.token, result.expiresIn || 3600);
        setUser(result.user);
        return { success: true };
      } else {
        return { success: false, error: result.message || 'Unknown error' };
      }
    } catch (error) {
      return { success: false, error: error.message || 'Network error' };
    }
  };

  const register = async (userData) => {
    try {
      const result = await ApiService.post(API_CONFIG.ENDPOINTS.REGISTER, userData);
      return { 
        success: result.success || false, 
        error: result.message 
      };
    } catch (error) {
      return { success: false, error: error.message || 'Network error' };
    }
  };

  const logout = async () => {
    try {
      // Gọi backend để invalidate token
      if (token) {
        await ApiService.post(API_CONFIG.ENDPOINTS.LOGOUT, {}, true);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setUser(null);
      setAuthToken(null);
    }
  };

  // Generate a simple browser fingerprint for enhanced security
  const generateBrowserFingerprint = async () => {
    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: Date.now()
    };
    
    return btoa(JSON.stringify(fingerprint));
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshToken,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// API Service
class ApiService {
  static cache = new Map();
  
  static async getCSRFToken() {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CSRF}`, {
        credentials: 'include'
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.csrfToken;
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
      return null;
    }
  }
  
  static async get(endpoint, requireAuth = false, options = {}) {
    const { useCache = true, retries = 2, expireTime = 60000, signal } = options;
    const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
    
    // Kiểm tra cache
    if (useCache && this.cache.has(cacheKey)) {
      const cachedData = this.cache.get(cacheKey);
      if (Date.now() - cachedData.timestamp < expireTime) {
        return cachedData.data;
      }
      this.cache.delete(cacheKey);
    }
    
    // Setup request
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (requireAuth && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Retry logic
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
          headers,
          credentials: 'include',
          signal
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        
        const data = await response.json();
        
        // Cache the successful response
        if (useCache) {
          this.cache.set(cacheKey, {
            data,
            timestamp: Date.now()
          });
        }
        
        return data;
      } catch (error) {
        lastError = error;
        if (error.name === 'AbortError') {
          throw error; // Don't retry if request was aborted
        }
        
        // If we've reached max retries, throw the error
        if (attempt === retries) {
          break;
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(r => setTimeout(r, 200 * Math.pow(2, attempt)));
      }
    }
    
    throw lastError;
  }

  static async post(endpoint, data, requireAuth = false, options = {}) {
    const { retries = 2, signal } = options;
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (requireAuth && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // CSRF protection for mutations
    const csrfToken = await this.getCSRFToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    
    // Retry logic
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
          credentials: 'include',
          signal
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        lastError = error;
        if (error.name === 'AbortError') {
          throw error;
        }
        
        if (attempt === retries) {
          break;
        }
        
        await new Promise(r => setTimeout(r, 200 * Math.pow(2, attempt)));
      }
    }
    
    throw lastError;
  }

  static async put(endpoint, data, requireAuth = false, options = {}) {
    const { retries = 2, signal } = options;
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (requireAuth && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // CSRF protection for mutations
    const csrfToken = await this.getCSRFToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    
    // Retry logic
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(data),
          credentials: 'include',
          signal
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        lastError = error;
        if (error.name === 'AbortError') {
          throw error;
        }
        
        if (attempt === retries) {
          break;
        }
        
        await new Promise(r => setTimeout(r, 200 * Math.pow(2, attempt)));
      }
    }
    
    throw lastError;
  }

  static async delete(endpoint, requireAuth = false, options = {}) {
    const { retries = 2, signal } = options;
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (requireAuth && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // CSRF protection for mutations
    const csrfToken = await this.getCSRFToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    
    // Retry logic
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
          method: 'DELETE',
          headers,
          credentials: 'include',
          signal
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        lastError = error;
        if (error.name === 'AbortError') {
          throw error;
        }
        
        if (attempt === retries) {
          break;
        }
        
        await new Promise(r => setTimeout(r, 200 * Math.pow(2, attempt)));
      }
    }
    
    throw lastError;
  }
}

// Components
const Header = ({ onAuthClick }) => {
  const { user, logout } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Trophy className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold text-gray-800">ContestApp</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <a href="#home" className="text-gray-700 hover:text-blue-600 transition-colors">Trang chủ</a>
              <a href="#contests" className="text-gray-700 hover:text-blue-600 transition-colors">Cuộc thi</a>
              <a href="#contestants" className="text-gray-700 hover:text-blue-600 transition-colors">Thí sinh</a>
              <a href="#news" className="text-gray-700 hover:text-blue-600 transition-colors">Tin tức</a>
              <a href="#gallery" className="text-gray-700 hover:text-blue-600 transition-colors">Thư viện</a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="bg-transparent outline-none text-sm w-48"
              />
            </div>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 hover:bg-gray-200 transition-colors"
                >
                  <img
                    src={user.avatar || "/api/placeholder/32/32"}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="hidden md:block text-sm font-medium">{user.name}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                    <div className="p-3 border-b">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <nav className="p-2">
                      <a href="#profile" className="flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded">
                        <User size={16} />
                        Hồ sơ cá nhân
                      </a>
                      <a href="#settings" className="flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded">
                        <Settings size={16} />
                        Cài đặt
                      </a>
                      <button
                        onClick={logout}
                        className="flex items-center gap-2 p-2 text-red-600 hover:bg-red-50 rounded w-full text-left"
                      >
                        <LogOut size={16} />
                        Đăng xuất
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onAuthClick('login')}
                  className="text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
                >
                  Đăng nhập
                </button>
                <button 
                  onClick={() => onAuthClick('register')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Đăng ký
                </button>
              </div>
            )}

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-800"
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {showMobileMenu && (
          <div className="md:hidden border-t bg-white">
            <nav className="p-4 space-y-3">
              <a href="#home" className="block text-gray-700 hover:text-blue-600">Trang chủ</a>
              <a href="#contests" className="block text-gray-700 hover:text-blue-600">Cuộc thi</a>
              <a href="#contestants" className="block text-gray-700 hover:text-blue-600">Thí sinh</a>
              <a href="#news" className="block text-gray-700 hover:text-blue-600">Tin tức</a>
              <a href="#gallery" className="block text-gray-700 hover:text-blue-600">Thư viện</a>
              <div className="pt-3 border-t">
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                  <Search size={16} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    className="bg-transparent outline-none text-sm flex-1"
                  />
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Trophy className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold">ContestApp</span>
            </div>
            <p className="text-gray-400 mb-4">
              Nền tảng cuộc thi hàng đầu Việt Nam, kết nối và tôn vinh tài năng.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center hover:bg-red-700 transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Cuộc thi</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Miss Universe Vietnam</a></li>
              <li><a href="#" className="hover:text-white transition-colors">The Voice Việt Nam</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Vietnam Idol</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Vietnam's Got Talent</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Trung tâm hỗ trợ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Hướng dẫn sử dụng</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Điều khoản dịch vụ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <div className="space-y-2 text-gray-400">
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <span>hello@contestapp.vn</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <span>+84 123 456 789</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>TP. Hồ Chí Minh, Việt Nam</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 ContestApp. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

const Banner = ({ banner }) => {
  if (!banner) return null;

  return (
    <div className="relative h-96 bg-gradient-to-r from-blue-600 to-purple-700 overflow-hidden">
      <img
        src={banner.image || "/api/placeholder/1200/400"}
        alt={banner.title}
        className="w-full h-full object-cover mix-blend-overlay"
      />
      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{banner.title}</h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto">
            {banner.description}
          </p>
          {banner.ctaText && banner.ctaLink && (
            <a
              href={banner.ctaLink}
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold mt-8 hover:bg-gray-100 transition-colors"
            >
              {banner.ctaText}
              <ArrowRight size={20} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const ContestCard = ({ contest }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative h-48">
        <img
          src={contest.image || "/api/placeholder/400/200"}
          alt={contest.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            contest.status === 'active' ? 'bg-green-100 text-green-800' :
            contest.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {contest.status === 'active' ? 'Đang diễn ra' :
             contest.status === 'upcoming' ? 'Sắp diễn ra' : 'Đã kết thúc'}
          </span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{contest.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{contest.description}</p>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Calendar size={16} />
            <span>{contest.deadline}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={16} />
            <span>{contest.participants} thí sinh</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            Xem chi tiết
          </button>
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Heart size={20} className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ContestantCard = ({ contestant }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative h-64">
        <img
          src={contestant.avatar || "/api/placeholder/300/400"}
          alt={contestant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4">
          <div className="bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm font-semibold">
            #{contestant.number}
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{contestant.name}</h3>
        <p className="text-blue-600 text-sm mb-2">{contestant.contest}</p>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{contestant.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Heart size={16} />
              <span>{contestant.likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle size={16} />
              <span>{contestant.comments}</span>
            </div>
          </div>
          <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
            Xem thêm
          </button>
        </div>
      </div>
    </div>
  );
};

const ArticleCard = ({ article }) => {
  return (
    <article className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative h-48">
        <img
          src={article.image || "/api/placeholder/400/200"}
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{article.category}</span>
          <span>•</span>
          <span>{article.publishDate}</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-3">{article.excerpt}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={article.author.avatar || "/api/placeholder/32/32"}
              alt={article.author.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-sm text-gray-700">{article.author.name}</span>
          </div>
          <a
            href={`#article/${article.id}`}
            className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1"
          >
            Đọc thêm
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </article>
  );
};

const AuthModal = ({ isOpen, onClose, defaultTab = 'login' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, register } = useAuth();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (activeTab === 'login') {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          onClose();
        } else {
          setError(result.error);
        }
      } else {
        const result = await register(formData);
        if (result.success) {
          setActiveTab('login');
          setError('');
          // Show success message
        } else {
          setError(result.error);
        }
      }
    } catch (error) {
      setError('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    // Redirect to OAuth endpoint
    window.location.href = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS[`${provider.toUpperCase()}_AUTH`]}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {activeTab === 'login' ? 'Đăng nhập' : 'Đăng ký'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex border-b mb-6">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 text-center font-medium ${
                activeTab === 'login'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500'
              }`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2 text-center font-medium ${
                activeTab === 'register'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500'
              }`}
            >
              Đăng ký
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {activeTab === 'register' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {activeTab === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Xác nhận mật khẩu
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={handleInputChange}
                />
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : (activeTab === 'login' ? 'Đăng nhập' : 'Đăng ký')}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Hoặc</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSocialLogin('google')}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Mail size={20} />
                <span className="text-sm font-medium">Google</span>
              </button>
              <button
                onClick={() => handleSocialLogin('facebook')}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Facebook size={20} />
                <span className="text-sm font-medium">Facebook</span>
              </button>
            </div>
          </div>

          {activeTab === 'login' && (
            <div className="mt-6 text-center">
              <a href="#forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                Quên mật khẩu?
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const result = await ApiService.put('/users/profile', formData, true);
      if (result.success) {
        setUser({ ...user, ...formData });
        setMessage('Cập nhật thông tin thành công!');
      } else {
        setMessage('Có lỗi xảy ra, vui lòng thử lại');
      }
    } catch (error) {
      setMessage('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const result = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPLOAD}/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await result.json();
      if (data.success) {
        setUser({ ...user, avatar: data.url });
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={user?.avatar || "/api/placeholder/100/100"}
                  alt={user?.fullName}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white"
                />
                <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 cursor-pointer hover:bg-gray-100 transition-colors">
                  <Camera size={16} className="text-gray-600" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="text-white">
                <h1 className="text-2xl font-bold">{user?.fullName}</h1>
                <p className="opacity-90">{user?.email}</p>
                <p className="text-sm opacity-75">
                  Thành viên từ {new Date(user?.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          </div>

          <div className="border-b">
            <nav className="flex">
              {[
                { id: 'general', label: 'Thông tin chung' },
                { id: 'security', label: 'Bảo mật' },
                { id: 'activities', label: 'Hoạt động' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 font-medium ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'general' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Thông tin cá nhân</h2>
                
                {message && (
                  <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                    message.includes('thành công') 
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}>
                    {message.includes('thành công') ? (
                      <CheckCircle size={16} />
                    ) : (
                      <AlertCircle size={16} />
                    )}
                    <span className="text-sm">{message}</span>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Địa điểm
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giới thiệu bản thân
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Bảo mật tài khoản</h2>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">Đổi mật khẩu</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Để bảo vệ tài khoản, hãy sử dụng mật khẩu mạnh và thay đổi định kỳ.
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mật khẩu hiện tại
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mật khẩu mới
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Xác nhận mật khẩu mới
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Cập nhật mật khẩu
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">Xác thực hai yếu tố</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Tăng cường bảo mật bằng cách bật xác thức hai yếu tố.
                    </p>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                      Kích hoạt 2FA
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">Thiết bị đăng nhập</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Quản lý các thiết bị đã đăng nhập vào tài khoản của bạn.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-white p-3 rounded border">
                        <div>
                          <p className="font-medium">Chrome trên Windows</p>
                          <p className="text-sm text-gray-500">Đăng nhập lần cuối: 2 giờ trước</p>
                        </div>
                        <button className="text-red-600 hover:text-red-700 text-sm">
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activities' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Hoạt động gần đây</h2>
                
                <div className="space-y-4">
                  {[
                    {
                      action: 'Bình luận bài viết',
                      target: 'Miss Universe Vietnam 2024',
                      time: '2 giờ trước',
                      icon: MessageCircle
                    },
                    {
                      action: 'Thích thí sinh',
                      target: 'Nguyễn Thu Hà',
                      time: '1 ngày trước',
                      icon: Heart
                    },
                    {
                      action: 'Chia sẻ bài viết',
                      target: 'Kết quả vòng chung kết',
                      time: '3 ngày trước',
                      icon: Share2
                    }
                  ].map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div key={index} className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Icon size={20} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-gray-600 text-sm">{activity.target}</p>
                        </div>
                        <span className="text-gray-500 text-sm">{activity.time}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const [banners, setBanners] = useState([]);
  const [contests, setContests] = useState([]);
  const [contestants, setContestants] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // Fetch data from API
        const [bannersData, contestsData, contestantsData, articlesData] = await Promise.all([
          ApiService.get(API_CONFIG.ENDPOINTS.BANNERS),
          ApiService.get(API_CONFIG.ENDPOINTS.CONTESTS + '?featured=true'),
          ApiService.get(API_CONFIG.ENDPOINTS.CONTESTANTS + '?featured=true'),
          ApiService.get(API_CONFIG.ENDPOINTS.ARTICLES + '?featured=true')
        ]);

        setBanners(bannersData.data || []);
        setContests(contestsData.data || []);
        setContestants(contestantsData.data || []);
        setArticles(articlesData.data || []);
      } catch (error) {
        console.error('Error fetching home data:', error);
        // Set mock data for demo
        setBanners([{
          id: 1,
          title: 'Miss Universe Vietnam 2024',
          description: 'Cuộc thi sắc đẹp lớn nhất năm đang diễn ra',
          image: '/api/placeholder/1200/400',
          ctaText: 'Xem ngay',
          ctaLink: '#contest/1'
        }]);
        
        setContests([
          {
            id: 1,
            title: 'Miss Universe Vietnam 2024',
            description: 'Cuộc thi sắc đẹp lớn nhất năm tại Việt Nam',
            image: '/api/placeholder/400/200',
            status: 'active',
            deadline: '31/12/2024',
            participants: 50
          },
          {
            id: 2,
            title: 'The Voice Việt Nam',
            description: 'Tìm kiếm giọng hát hay nhất Việt Nam',
            image: '/api/placeholder/400/200',
            status: 'upcoming',
            deadline: '15/01/2025',
            participants: 100
          },
          {
            id: 3,
            title: 'Vietnam Idol 2024',
            description: 'Thần tượng âm nhạc mới của Việt Nam',
            image: '/api/placeholder/400/200',
            status: 'active',
            deadline: '28/02/2025',
            participants: 75
          }
        ]);

        setContestants([
          {
            id: 1,
            name: 'Nguyễn Thu Hà',
            number: 'SBD001',
            contest: 'Miss Universe Vietnam 2024',
            avatar: '/api/placeholder/300/400',
            description: 'Sinh viên năm cuối ngành Kinh tế quốc tế',
            likes: 1250,
            comments: 89
          },
          {
            id: 2,
            name: 'Trần Minh Anh',
            number: 'SBD002',
            contest: 'The Voice Việt Nam',
            avatar: '/api/placeholder/300/400',
            description: 'Ca sĩ trẻ đầy triển vọng',
            likes: 890,
            comments: 45
          },
          {
            id: 3,
            name: 'Lê Thị Bình',
            number: 'SBD003',
            contest: 'Vietnam Idol',
            avatar: '/api/placeholder/300/400',
            description: 'Giọng ca ngọt ngào từ miền Tây',
            likes: 567,
            comments: 32
          }
        ]);

        setArticles([
          {
            id: 1,
            title: 'Kết quả vòng chung kết Miss Universe Vietnam 2024',
            excerpt: 'Đêm chung kết Miss Universe Vietnam 2024 đã diễn ra thành công với nhiều màn trình diễn ấn tượng...',
            image: '/api/placeholder/400/200',
            category: 'Tin tức',
            publishDate: '15/03/2024',
            author: {
              name: 'Minh Anh',
              avatar: '/api/placeholder/32/32'
            }
          },
          {
            id: 2,
            title: 'Bí quyết thành công của các thí sinh The Voice',
            excerpt: 'Những câu chuyện truyền cảm hứng từ hành trình của các thí sinh The Voice Việt Nam...',
            image: '/api/placeholder/400/200',
            category: 'Chia sẻ',
            publishDate: '12/03/2024',
            author: {
              name: 'Thu Linh',
              avatar: '/api/placeholder/32/32'
            }
          },
          {
            id: 3,
            title: 'Xu hướng thời trang trong các cuộc thi sắc đẹp',
            excerpt: 'Cập nhật những xu hướng thời trang mới nhất từ các cuộc thi sắc đẹp quốc tế...',
            image: '/api/placeholder/400/200',
            category: 'Thời trang',
            publishDate: '10/03/2024',
            author: {
              name: 'Hoàng Nam',
              avatar: '/api/placeholder/32/32'
            }
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Section */}
      {banners.length > 0 && <Banner banner={banners[0]} />}

      <div className="container mx-auto px-4 py-12">
        {/* Featured Contests Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Cuộc thi nổi bật</h2>
            <a href="#contests" className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
              Xem tất cả
              <ChevronRight size={20} />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {contests.map(contest => (
              <ContestCard key={contest.id} contest={contest} />
            ))}
          </div>
        </section>

        {/* Featured Contestants Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Thí sinh tiêu biểu</h2>
            <a href="#contestants" className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
              Xem tất cả
              <ChevronRight size={20} />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {contestants.map(contestant => (
              <ContestantCard key={contestant.id} contestant={contestant} />
            ))}
          </div>
        </section>

        {/* Latest Articles Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Tin tức mới nhất</h2>
            <a href="#news" className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
              Xem tất cả
              <ChevronRight size={20} />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Tham gia ngay hôm nay</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Đăng ký tài khoản để tham gia các cuộc thi, bình chọn cho thí sinh yêu thích và nhận thông tin cập nhật mới nhất.
          </p>
          <button className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Đăng ký ngay
          </button>
        </section>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');

  const renderPage = () => {
    switch(currentPage) {
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Header 
          onAuthClick={(tab) => {
            setAuthModalTab(tab);
            setShowAuthModal(true);
          }}
        />
        <main>
          {renderPage()}
        </main>
        <Footer />
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultTab={authModalTab}
        />
      </div>
    </AuthProvider>
  );
};

export default App;
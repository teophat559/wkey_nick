import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Lock, X, Facebook, Mail, Chrome, AlertCircle } from 'lucide-react';

const LoginComponent = ({ onClose, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showGoogleOptions, setShowGoogleOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginAttempts, setLoginAttempts] = useState(0);
  const submitTimer = useRef(null);
  const usernameRef = useRef(null);

  // Focus username input on mount
  useEffect(() => {
    if (usernameRef.current) {
      usernameRef.current.focus();
    }
    
    // Cleanup timers on unmount
    return () => {
      if (submitTimer.current) {
        clearTimeout(submitTimer.current);
      }
    };
  }, []);

  // Validate inputs
  const validateInputs = () => {
    const newErrors = {};
    
    if (!username.trim()) {
      newErrors.username = 'Vui lòng nhập tên đăng nhập';
    }
    
    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(async () => {
    // Prevent multiple submissions
    if (isLoading) return;
    
    // Validate form
    if (!validateInputs()) return;
    
    setIsLoading(true);
    
    try {
      // Security - Add small delay on failed attempts to prevent brute force
      if (loginAttempts > 2) {
        await new Promise(resolve => {
          submitTimer.current = setTimeout(resolve, loginAttempts * 500);
        });
      }
      
      const trimmedUsername = username.trim();
      
      const result = await onLogin({ 
        username: trimmedUsername, 
        password, 
        rememberMe 
      });
      
      if (!result.success) {
        setLoginAttempts(prev => prev + 1);
        setErrors({ form: result.error || 'Đăng nhập thất bại. Vui lòng thử lại.' });
      }
    } catch (error) {
      setErrors({ form: 'Đã xảy ra lỗi. Vui lòng thử lại sau.' });
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [username, password, rememberMe, isLoading, loginAttempts, onLogin]);

  const handleSocialLogin = useCallback((provider) => {
    setIsLoading(true);
    onLogin({ provider })
      .finally(() => setIsLoading(false));
  }, [onLogin]);

  const toggleGoogleOptions = useCallback(() => {
    setShowGoogleOptions(prev => !prev);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        width: '400px',
        maxWidth: '90vw',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#333',
            margin: 0
          }}>
            Đăng nhập
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Login Form */}
        <div>
          {/* Username Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333'
            }}>
              Tên đăng nhập
            </label>
            <div style={{ position: 'relative' }}>
              <User 
                size={18} 
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#999'
                }}
              />
              <input
                ref={usernameRef}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  border: errors.username ? '1px solid #e53935' : '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = errors.username ? '#e53935' : '#4285f4'}
                onBlur={(e) => e.target.style.borderColor = errors.username ? '#e53935' : '#ddd'}
                autoComplete="username"
              />
              {errors.username && (
                <div style={{ color: '#e53935', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center' }}>
                  <AlertCircle size={12} style={{ marginRight: '4px' }} />
                  {errors.username}
                </div>
              )}
            </div>
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333'
            }}>
              Mật khẩu
            </label>
            <div style={{ position: 'relative' }}>
              <Lock 
                size={18} 
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#999'
                }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  border: errors.password ? '1px solid #e53935' : '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = errors.password ? '#e53935' : '#4285f4'}
                onBlur={(e) => e.target.style.borderColor = errors.password ? '#e53935' : '#ddd'}
                autoComplete="current-password"
              />
              {errors.password && (
                <div style={{ color: '#e53935', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center' }}>
                  <AlertCircle size={12} style={{ marginRight: '4px' }} />
                  {errors.password}
                </div>
              )}
            </div>
          </div>

          {/* Remember me checkbox */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{
                marginRight: '8px',
                width: '16px',
                height: '16px'
              }}
            />
            <label htmlFor="remember" style={{
              fontSize: '14px',
              color: '#333',
              cursor: 'pointer'
            }}>
              Ghi nhớ đăng nhập
            </label>
          </div>

          {/* Form Error Message */}
          {errors.form && (
            <div style={{ 
              color: '#e53935', 
              fontSize: '14px', 
              marginBottom: '16px', 
              padding: '8px 12px',
              backgroundColor: '#ffebee',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center' 
            }}>
              <AlertCircle size={16} style={{ marginRight: '8px', flexShrink: 0 }} />
              <span>{errors.form}</span>
            </div>
          )}
          
          {/* Login Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: isLoading ? '#90caf9' : '#4285f4',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              marginBottom: '24px',
              position: 'relative'
            }}
            onMouseOver={(e) => !isLoading && (e.target.style.backgroundColor = '#3367d6')}
            onMouseOut={(e) => !isLoading && (e.target.style.backgroundColor = '#4285f4')}
          >
            {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </div>

        {/* Divider */}
        <div style={{
          position: 'relative',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            height: '1px',
            backgroundColor: '#e5e5e5',
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0
          }}></div>
          <span style={{
            backgroundColor: 'white',
            color: '#666',
            fontSize: '14px',
            padding: '0 16px',
            position: 'relative'
          }}>
            Hoặc đăng nhập với
          </span>
        </div>

        {/* Social Login Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          {/* Facebook Button */}
          <button
            onClick={() => handleSocialLogin('facebook')}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#1877f2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#166fe5'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#1877f2'}
          >
            <div style={{
              width: '18px',
              height: '18px',
              backgroundColor: 'white',
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ color: '#1877f2', fontSize: '12px', fontWeight: 'bold' }}>f</span>
            </div>
            Facebook
          </button>

          {/* Google Button */}
          <button
            onClick={toggleGoogleOptions}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#dc4e41',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#c23321'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#dc4e41'}
          >
            <div style={{
              width: '18px',
              height: '18px',
              backgroundColor: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ color: '#dc4e41', fontSize: '11px', fontWeight: 'bold' }}>G</span>
            </div>
            Google
          </button>
        </div>

        {/* Google Options Dropdown */}
        {showGoogleOptions && (
          <div style={{
            border: '1px solid #e5e5e5',
            borderRadius: '8px',
            padding: '8px',
            backgroundColor: '#f9f9f9',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {[
              { name: 'Yahoo Mail', icon: 'Y', bgColor: '#6b46c1' },
              { name: 'Hotmail', icon: 'H', bgColor: '#0078d4' },
              { name: 'Email', icon: '@', bgColor: '#666' }
            ].map((option, index) => (
              <button
                key={index}
                onClick={() => handleSocialLogin(option.name.toLowerCase().replace(' ', ''))}
                style={{
                  width: '100%',
                  padding: '10px',
                  margin: '4px 0',
                  backgroundColor: 'white',
                  border: '1px solid #e5e5e5',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: option.bgColor,
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {option.icon}
                </div>
                {option.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Demo Component
const LoginDemo = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [loginResult, setLoginResult] = useState(null);

  const handleLogin = (credentials) => {
    // Simulate login process
    setTimeout(() => {
      if (credentials.provider) {
        setLoginResult(`Đăng nhập thành công với ${credentials.provider}`);
      } else {
        setLoginResult(`Đăng nhập thành công với tên đăng nhập: ${credentials.username}, Ghi nhớ: ${credentials.rememberMe ? 'Có' : 'Không'}`);
      }
      setShowLogin(false);
    }, 500);
  };

  const handleCloseLogin = () => {
    setShowLogin(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#333', marginBottom: '30px' }}>Demo Component Đăng Nhập</h1>
        
        <button
          onClick={() => setShowLogin(true)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '20px',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#3367d6'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#4285f4'}
        >
          Mở Form Đăng Nhập
        </button>

        {loginResult && (
          <div style={{
            backgroundColor: '#e8f5e9',
            color: '#2e7d32',
            padding: '16px',
            borderRadius: '8px',
            marginTop: '20px',
            border: '1px solid #c8e6c9',
            textAlign: 'left'
          }}>
            <strong>Thông báo thành công:</strong><br/>
            {loginResult}
            <button
              onClick={() => setLoginResult(null)}
              style={{
                marginLeft: '16px',
                padding: '4px 8px',
                backgroundColor: 'transparent',
                border: '1px solid #2e7d32',
                borderRadius: '4px',
                color: '#2e7d32',
                cursor: 'pointer'
              }}
            >
              Xóa
            </button>
          </div>
        )}

        {/* Left Menu Info Section (for reference) */}
        <div style={{
          marginTop: '40px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'left'
        }}>
          <h3 style={{ color: '#333', marginBottom: '16px' }}>📋 Menu Trái - Mục "Thông tin"</h3>
          <p style={{ color: '#666', marginBottom: '12px' }}>
            Theo yêu cầu của bạn, các mục sau sẽ được gộp chung thành mục "Thông tin":
          </p>
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '16px',
            borderRadius: '6px',
            marginTop: '12px'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '8px', color: '#333' }}>🔗 Thông tin</div>
            <div style={{ paddingLeft: '16px', color: '#666' }}>
              <div style={{ margin: '4px 0' }}>📚 Thư viện</div>
              <div style={{ margin: '4px 0' }}>💬 Tin nhắn</div>
              <div style={{ margin: '4px 0' }}>📰 Tin tức</div>
              <div style={{ margin: '4px 0' }}>🔔 Thông báo</div>
            </div>
          </div>
        </div>

        {/* Technical Notes */}
        <div style={{
          marginTop: '20px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'left'
        }}>
          <h3 style={{ color: '#333', marginBottom: '16px' }}>🔧 Ghi chú kỹ thuật</h3>
          <ul style={{ color: '#666', paddingLeft: '20px', lineHeight: '1.6' }}>
            <li>Component sử dụng React hooks (useState) để quản lý state</li>
            <li>Tất cả style được viết inline CSS để dễ tùy chỉnh</li>
            <li>Sử dụng Lucide icons cho các icon (có thể thay thế bằng icon khác)</li>
            <li>Dropdown Google options xuất hiện khi click vào nút Google</li>
            <li>Support Enter key để đăng nhập</li>
            <li>Responsive design hoạt động tốt trên mobile</li>
          </ul>
        </div>
      </div>

      {showLogin && (
        <LoginComponent
          onClose={handleCloseLogin}
          onLogin={handleLogin}
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default LoginDemo;
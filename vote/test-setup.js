import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';
import Header from '../components/Header';

// Mock API for testing
const mockApiService = {
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

// Helper function to render with providers
const renderWithProviders = (component, { authValue } = {}) => {
  const AuthWrapper = ({ children }) => (
    <AuthProvider value={authValue}>
      {children}
    </AuthProvider>
  );
  
  return render(component, { wrapper: AuthWrapper });
};

describe('AuthModal Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form by default', () => {
    render(<AuthModal isOpen={true} onClose={() => {}} />);
    
    expect(screen.getByText('Đăng nhập')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/mật khẩu/i)).toBeInTheDocument();
  });

  test('switches to register form when tab clicked', async () => {
    render(<AuthModal isOpen={true} onClose={() => {}} />);
    
    const registerTab = screen.getByText('Đăng ký');
    fireEvent.click(registerTab);
    
    expect(screen.getByPlaceholderText(/họ và tên/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/số điện thoại/i)).toBeInTheDocument();
  });

  test('validates email format', async () => {
    const user = userEvent.setup();
    render(<AuthModal isOpen={true} onClose={() => {}} />);
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    await user.type(emailInput, 'invalid-email');
    
    const submitButton = screen.getByRole('button', { name: /đăng nhập/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/email không hợp lệ/i)).toBeInTheDocument();
    });
  });

  test('shows loading state during login', async () => {
    mockApiService.post.mockResolvedValueOnce({ success: true });
    
    const user = userEvent.setup();
    render(<AuthModal isOpen={true} onClose={() => {}} />);
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/mật khẩu/i);
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    const submitButton = screen.getByRole('button', { name: /đăng nhập/i });
    fireEvent.click(submitButton);
    
    expect(screen.getByText(/đang xử lý/i)).toBeInTheDocument();
  });
});

describe('Header Component', () => {
  test('shows login/register buttons when not authenticated', () => {
    renderWithProviders(<Header onAuthClick={() => {}} />, {
      authValue: { user: null, loading: false }
    });
    
    expect(screen.getByText('Đăng nhập')).toBeInTheDocument();
    expect(screen.getByText('Đăng ký')).toBeInTheDocument();
  });

  test('shows user menu when authenticated', () => {
    const mockUser = { name: 'John Doe', email: 'john@example.com' };
    
    renderWithProviders(<Header onAuthClick={() => {}} />, {
      authValue: { user: mockUser, loading: false }
    });
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('toggles mobile menu', () => {
    renderWithProviders(<Header onAuthClick={() => {}} />, {
      authValue: { user: null, loading: false }
    });
    
    const menuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuButton);
    
    expect(screen.getByText('Trang chủ')).toBeVisible();
  });
});

describe('ApiService', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test('makes GET request with correct headers', async () => {
    const mockResponse = { data: { id: 1, name: 'Test' } };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    // Test your API service here
  });

  test('includes authorization header when required', async () => {
    localStorage.setItem('token', 'test-token');
    
    const mockResponse = { data: {} };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    // Test your API service here
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token',
        }),
      })
    );
  });
});

describe('Custom Hooks', () => {
  test('useLocalStorage hook', () => {
    // Test your custom hooks here
  });

  test('useDebounce hook', () => {
    // Test debounce functionality
  });
});

// Integration Tests
describe('User Flow Tests', () => {
  test('complete login flow', async () => {
    // Test complete user login flow
  });

  test('contest voting flow', async () => {
    // Test voting for contestants
  });

  test('comment posting flow', async () => {
    // Test posting comments
  });
});
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AdminLogin from '../AdminLogin';
import { authService } from '../../../../services/auth.service';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null })
  };
});

const mockLogin = vi.fn();
vi.mock('../../../../hooks/useAuth', () => ({
  useAuth: () => ({ login: mockLogin })
}));

vi.mock('../../../../services/auth.service', () => ({
  authService: {
    login: vi.fn()
  }
}));

describe('AdminLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits form and navigates on success', async () => {
    (authService.login as any).mockResolvedValue({ access_token: 'valid-token' });

    render(
      <BrowserRouter>
        <AdminLogin />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('admin@faceattend.ai'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('admin', 'password');
      expect(mockLogin).toHaveBeenCalledWith('valid-token');
      expect(mockNavigate).toHaveBeenCalledWith('/admin', { replace: true });
    });
  });

  it('displays error on failed login', async () => {
    (authService.login as any).mockRejectedValue(new Error('Invalid credentials'));

    render(
      <BrowserRouter>
        <AdminLogin />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('admin@faceattend.ai'), { target: { value: 'wrong' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrong' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid username or password')).toBeInTheDocument();
    });
  });
});

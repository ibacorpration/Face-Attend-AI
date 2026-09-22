import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Sidebar } from '../Sidebar';

// Mock useAuth
const mockLogout = vi.fn();
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    logout: mockLogout
  })
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

const renderSidebar = () => {
  return render(
    <BrowserRouter>
      <Sidebar />
    </BrowserRouter>
  );
};

describe('Sidebar component', () => {
  it('renders branding and links', () => {
    renderSidebar();
    
    expect(screen.getByText('FaceAttend AI')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Employees')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('calls logout and navigates on Logout click', () => {
    renderSidebar();
    
    const logoutBtn = screen.getByText('Logout');
    fireEvent.click(logoutBtn);
    
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/admin/login');
  });
});

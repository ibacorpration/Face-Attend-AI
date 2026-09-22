import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import LandingPage from '../LandingPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('LandingPage', () => {
  it('renders branding and selection cards', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(screen.getByText('FaceAttend AI')).toBeInTheDocument();
    expect(screen.getByText('Employee')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('navigates to /camera when Employee is clicked', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Employee').closest('button') as HTMLElement);
    expect(mockNavigate).toHaveBeenCalledWith('/camera');
  });

  it('navigates to /admin/login when Admin is clicked', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Admin').closest('button') as HTMLElement);
    expect(mockNavigate).toHaveBeenCalledWith('/admin/login');
  });
});

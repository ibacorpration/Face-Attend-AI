import React, { ReactNode } from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider } from '../../context/AuthContext';
import { useAuth } from '../useAuth';

// Test component to consume the hook
const TestComponent = () => {
  const { token, login, logout, isAuthenticated } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Logged In' : 'Logged Out'}</div>
      <div data-testid="token">{token || 'none'}</div>
      <button onClick={() => login('dummy-token')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('useAuth hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize as logged out', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged Out');
    expect(screen.getByTestId('token')).toHaveTextContent('none');
  });

  it('should log in and save token', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    act(() => {
      screen.getByText('Login').click();
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged In');
    expect(screen.getByTestId('token')).toHaveTextContent('dummy-token');
    expect(localStorage.getItem('token')).toBe('dummy-token');
  });

  it('should log out and remove token', () => {
    localStorage.setItem('token', 'existing-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged In');

    act(() => {
      screen.getByText('Logout').click();
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged Out');
    expect(localStorage.getItem('token')).toBeNull();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../api';
import { authService } from '../auth.service';

// Mock the api module
vi.mock('../api', () => {
  return {
    default: {
      post: vi.fn(),
    }
  };
});

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send urlencoded form data on login', async () => {
    const mockResponse = { data: { access_token: 'fake-token', token_type: 'bearer' } };
    (api.post as any).mockResolvedValue(mockResponse);

    const result = await authService.login('admin', 'password123');

    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith('/auth/login', expect.any(URLSearchParams), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    expect(result).toEqual(mockResponse.data);
  });
});

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCamera } from '../useCamera';

describe('useCamera hook', () => {
  let mockGetUserMedia: any;

  beforeEach(() => {
    // Mock navigator.mediaDevices.getUserMedia
    mockGetUserMedia = vi.fn().mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }],
    });
    
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: { getUserMedia: mockGetUserMedia },
      writable: true
    });
  });

  it('initializes with inactive stream', () => {
    const { result } = renderHook(() => useCamera());
    expect(result.current.isStreamActive).toBe(false);
    expect(result.current.videoRef.current).toBeNull();
  });

  it('starts camera and sets stream active', async () => {
    const { result } = renderHook(() => useCamera());

    // Mock video element attachment
    (result.current.videoRef as any).current = document.createElement('video');
    
    // Simulate playing event
    setTimeout(() => {
      if (result.current.videoRef.current) {
        result.current.videoRef.current.dispatchEvent(new Event('playing'));
      }
    }, 50);

    await act(async () => {
      await result.current.startCamera();
    });

    expect(mockGetUserMedia).toHaveBeenCalledWith({ video: true });
    // isStreamActive becomes true after the 'playing' event fires
    expect(result.current.isStreamActive).toBe(true);
  });

  it('stops camera and cleans up tracks', async () => {
    const mockStop = vi.fn();
    mockGetUserMedia.mockResolvedValue({
      getTracks: () => [{ stop: mockStop }],
    });

    const { result } = renderHook(() => useCamera());
    (result.current.videoRef as any).current = document.createElement('video');
    
    await act(async () => {
      await result.current.startCamera();
    });

    act(() => {
      result.current.stopCamera();
    });

    expect(mockStop).toHaveBeenCalled();
    expect(result.current.isStreamActive).toBe(false);
  });
});

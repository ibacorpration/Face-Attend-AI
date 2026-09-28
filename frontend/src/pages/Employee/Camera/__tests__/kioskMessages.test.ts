import { describe, it, expect } from 'vitest';
import { getKioskMessage, KIOSK_MESSAGES, ErrorCode } from '../kioskMessages';

describe('kioskMessages', () => {
  it('every ErrorCode has a non-empty message', () => {
    Object.values(KIOSK_MESSAGES).forEach(msg => {
      expect(msg).toBeTruthy();
      expect(typeof msg).toBe('string');
      expect(msg.length).toBeGreaterThan(0);
    });
  });

  it('getKioskMessage with undefined or unknown returns SERVER_ERROR text', () => {
    expect(getKioskMessage(undefined)).toBe(KIOSK_MESSAGES.SERVER_ERROR);
    expect(getKioskMessage('FAKE_CODE')).toBe(KIOSK_MESSAGES.SERVER_ERROR);
  });

  it('no message contains technical terms', () => {
    const forbiddenTerms = [
      'error', '500', 'status code', 'liveness',
      'embedding', 'exception', 'laplacian', 'variance', 'ai '
    ];
    
    Object.values(KIOSK_MESSAGES).forEach(msg => {
      const lower = msg.toLowerCase();
      forbiddenTerms.forEach(term => {
        expect(lower).not.toContain(term);
      });
      // check exact word "server"
      expect(lower).not.toMatch(/\bserver\b/);
    });
  });
});

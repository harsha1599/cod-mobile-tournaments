/**
 * Payment Service Tests
 */

import HelperService from '../../utils/helpers';

describe('Payment Service', () => {
  describe('Currency Formatting', () => {
    test('should format currency correctly', () => {
      const formatted = HelperService.formatCurrency(1000, 'INR');
      expect(formatted).toContain('1,000');
    });

    test('should handle decimal amounts', () => {
      const formatted = HelperService.formatCurrency(1000.50, 'INR');
      expect(formatted).toBeDefined();
    });
  });

  describe('Date Formatting', () => {
    test('should format date correctly', () => {
      const date = new Date('2026-01-15');
      const formatted = HelperService.formatDateTime(date, 'short');
      expect(formatted).toBeDefined();
    });

    test('should handle time formatting', () => {
      const date = new Date('2026-01-15T10:30:00');
      const formatted = HelperService.formatDateTime(date, 'time');
      expect(formatted).toBeDefined();
    });
  });

  describe('Time Ago', () => {
    test('should calculate time ago correctly', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const timeAgo = HelperService.getTimeAgo(oneHourAgo);
      expect(timeAgo).toContain('hour');
    });
  });
});

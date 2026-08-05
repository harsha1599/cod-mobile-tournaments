/**
 * Tournament Service Tests
 */

import HelperService from '../../utils/helpers';

describe('Tournament Service', () => {
  describe('Win Rate Calculation', () => {
    test('should calculate win rate correctly', () => {
      expect(HelperService.calculateWinRate(10, 20)).toBe('50.00');
      expect(HelperService.calculateWinRate(8, 10)).toBe('80.00');
      expect(HelperService.calculateWinRate(0, 10)).toBe('0.00');
    });

    test('should handle division by zero', () => {
      expect(HelperService.calculateWinRate(10, 0)).toBe(0);
    });
  });

  describe('Percentage Calculation', () => {
    test('should calculate percentage correctly', () => {
      expect(HelperService.calculatePercentage(50, 100)).toBe(50);
      expect(HelperService.calculatePercentage(25, 100)).toBe(25);
    });

    test('should handle division by zero', () => {
      expect(HelperService.calculatePercentage(50, 0)).toBe(0);
    });
  });

  describe('Array Operations', () => {
    test('should sort array by field', () => {
      const array = [
        { name: 'Alice', score: 100 },
        { name: 'Bob', score: 50 },
        { name: 'Charlie', score: 75 },
      ];
      const sorted = HelperService.sortByField(array, 'score', false);
      expect(sorted[0].score).toBe(100);
      expect(sorted[2].score).toBe(50);
    });

    test('should group array by field', () => {
      const array = [
        { category: 'A', value: 1 },
        { category: 'B', value: 2 },
        { category: 'A', value: 3 },
      ];
      const grouped = HelperService.groupByField(array, 'category');
      expect(grouped.A.length).toBe(2);
      expect(grouped.B.length).toBe(1);
    });
  });
});

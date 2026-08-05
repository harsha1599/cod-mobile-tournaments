/**
 * Validation Service Tests
 */

import ValidationService from '../../utils/validation';

describe('Validation Service', () => {
  describe('Username Validation', () => {
    test('should validate correct username', () => {
      expect(ValidationService.isValidUsername('validUser123')).toBe(true);
      expect(ValidationService.isValidUsername('user_name')).toBe(true);
    });

    test('should reject invalid username', () => {
      expect(ValidationService.isValidUsername('ab')).toBe(false);
      expect(ValidationService.isValidUsername('username-with-dash')).toBe(false);
      expect(ValidationService.isValidUsername('a'.repeat(21))).toBe(false);
    });
  });

  describe('Required Field Validation', () => {
    test('should validate required fields', () => {
      expect(ValidationService.isRequired('value')).toBe(true);
      expect(ValidationService.isRequired('')).toBe(false);
      expect(ValidationService.isRequired(null)).toBe(false);
      expect(ValidationService.isRequired(undefined)).toBe(false);
    });
  });

  describe('Amount Validation', () => {
    test('should validate amount', () => {
      expect(ValidationService.isValidAmount(100)).toBe(true);
      expect(ValidationService.isValidAmount(500, 100, 1000)).toBe(true);
      expect(ValidationService.isValidAmount(50, 100, 1000)).toBe(false);
    });
  });

  describe('Form Validation', () => {
    test('should validate entire form', () => {
      const formData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      };

      const rules = {
        email: (value) => (ValidationService.isValidEmail(value) ? null : 'Invalid email'),
        password: (value) => (ValidationService.isStrongPassword(value) ? null : 'Weak password'),
      };

      const result = ValidationService.validateForm(formData, rules);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });
  });
});

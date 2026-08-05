/**
 * Auth Service Tests
 */

import ValidationService from '../../utils/validation';

describe('Auth Service', () => {
  describe('Email Validation', () => {
    test('should validate correct email format', () => {
      expect(ValidationService.isValidEmail('test@example.com')).toBe(true);
      expect(ValidationService.isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    test('should reject invalid email format', () => {
      expect(ValidationService.isValidEmail('invalid.email')).toBe(false);
      expect(ValidationService.isValidEmail('@example.com')).toBe(false);
      expect(ValidationService.isValidEmail('test@')).toBe(false);
    });
  });

  describe('Password Validation', () => {
    test('should validate strong password', () => {
      expect(ValidationService.isStrongPassword('SecurePass123!')).toBe(true);
    });

    test('should reject weak password', () => {
      expect(ValidationService.isStrongPassword('weak')).toBe(false);
      expect(ValidationService.isStrongPassword('nouppercase123!')).toBe(false);
      expect(ValidationService.isStrongPassword('NOLOWERCASE123!')).toBe(false);
    });
  });

  describe('Password Strength', () => {
    test('should calculate password strength correctly', () => {
      expect(ValidationService.getPasswordStrength('weak')).toBe(0);
      expect(ValidationService.getPasswordStrength('WeakPass1')).toBeGreaterThan(0);
      expect(ValidationService.getPasswordStrength('SecurePass123!')).toBe(5);
    });
  });
});

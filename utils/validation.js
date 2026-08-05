/**
 * Validation Utilities - Form and data validation functions
 */

class ValidationService {
  /**
   * Validate email format
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  static isStrongPassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);

    return (
      password.length >= minLength
      && hasUpperCase
      && hasLowerCase
      && hasNumbers
      && hasSpecialChar
    );
  }

  /**
   * Get password strength score (0-5)
   */
  static getPasswordStrength(password) {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;

    return strength;
  }

  /**
   * Validate username
   */
  static isValidUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  }

  /**
   * Validate phone number
   */
  static isValidPhone(phone) {
    const phoneRegex = /^[0-9]{10}$/; // Adjust based on region
    return phoneRegex.test(phone.replace(/\D/g, ''));
  }

  /**
   * Validate URL
   */
  static isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Validate required field
   */
  static isRequired(value) {
    return value !== null && value !== undefined && value.toString().trim() !== '';
  }

  /**
   * Validate field length
   */
  static isValidLength(value, min, max) {
    const length = value.toString().length;
    return length >= min && length <= max;
  }

  /**
   * Validate file size
   */
  static isValidFileSize(file, maxSizeMB) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  /**
   * Validate file type
   */
  static isValidFileType(file, allowedTypes) {
    return allowedTypes.includes(file.type);
  }

  /**
   * Validate form data
   */
  static validateForm(formData, rules) {
    const errors = {};

    Object.entries(rules).forEach(([field, rule]) => {
      const value = formData[field];
      const error = rule(value);
      if (error) {
        errors[field] = error;
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Validate amount for payments
   */
  static isValidAmount(amount, min = 0, max = Number.MAX_SAFE_INTEGER) {
    const num = parseFloat(amount);
    return !isNaN(num) && num >= min && num <= max;
  }

  /**
   * Validate game ID format (COD Mobile)
   */
  static isValidGameID(gameId) {
    // Adjust based on actual COD Mobile ID format
    return gameId && gameId.length >= 3 && gameId.length <= 20;
  }
}

export default ValidationService;

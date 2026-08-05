/**
 * Helper Functions - Reusable utility functions
 */

class HelperService {
  /**
   * Format currency
   */
  static formatCurrency(amount, currency = 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
    }).format(amount);
  }

  /**
   * Format date and time
   */
  static formatDateTime(date, format = 'short') {
    const options = {
      short: { year: '2-digit', month: 'short', day: 'numeric' },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
      time: { hour: '2-digit', minute: '2-digit', second: '2-digit' },
    };

    return new Intl.DateTimeFormat('en-IN', options[format] || options.short).format(
      new Date(date)
    );
  }

  /**
   * Get time ago (e.g., "2 hours ago")
   */
  static getTimeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)} years ago`;

    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)} months ago`;

    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)} days ago`;

    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)} hours ago`;

    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)} minutes ago`;

    return `${Math.floor(seconds)} seconds ago`;
  }

  /**
   * Generate unique ID
   */
  static generateId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Shuffle array
   */
  static shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Sort array of objects
   */
  static sortByField(array, field, ascending = true) {
    return [...array].sort((a, b) => {
      if (a[field] < b[field]) return ascending ? -1 : 1;
      if (a[field] > b[field]) return ascending ? 1 : -1;
      return 0;
    });
  }

  /**
   * Group array by field
   */
  static groupByField(array, field) {
    return array.reduce((grouped, item) => {
      const key = item[field];
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
      return grouped;
    }, {});
  }

  /**
   * Deep clone object
   */
  static deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Merge objects
   */
  static mergeObjects(target, source) {
    return { ...target, ...source };
  }

  /**
   * Truncate text
   */
  static truncateText(text, maxLength = 50) {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  }

  /**
   * Capitalize string
   */
  static capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Convert kebab-case to camelCase
   */
  static toCamelCase(str) {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }

  /**
   * Get URL parameters
   */
  static getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const obj = {};
    params.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }

  /**
   * Debounce function
   */
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle function
   */
  static throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  }

  /**
   * Calculate percentage
   */
  static calculatePercentage(value, total) {
    return total > 0 ? (value / total) * 100 : 0;
  }

  /**
   * Calculate win rate
   */
  static calculateWinRate(wins, total) {
    return total > 0 ? ((wins / total) * 100).toFixed(2) : 0;
  }
}

export default HelperService;

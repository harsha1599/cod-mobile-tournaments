/**
 * Constants - Application-wide constants
 */

const CONSTANTS = {
  // Tournament Status
  TOURNAMENT_STATUS: {
    UPCOMING: 'upcoming',
    ONGOING: 'ongoing',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  },

  // Tournament Format
  TOURNAMENT_FORMAT: {
    SOLO: 'solo',
    DUO: 'duo',
    SQUAD: 'squad',
    BATTLE_ROYALE: 'battle_royale',
  },

  // User Roles
  USER_ROLES: {
    PLAYER: 'player',
    MODERATOR: 'moderator',
    ADMIN: 'admin',
  },

  // Registration Status
  REGISTRATION_STATUS: {
    PENDING: 'pending',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    DISQUALIFIED: 'disqualified',
  },

  // Payment Status
  PAYMENT_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
    CANCELLED: 'cancelled',
  },

  // Payout Status
  PAYOUT_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    ON_HOLD: 'on_hold',
  },

  // Match Result Status
  RESULT_STATUS: {
    PENDING_SUBMISSION: 'pending_submission',
    PENDING_VERIFICATION: 'pending_verification',
    VERIFIED: 'verified',
    DISPUTED: 'disputed',
    REJECTED: 'rejected',
  },

  // Dispute Status
  DISPUTE_STATUS: {
    OPEN: 'open',
    IN_REVIEW: 'in_review',
    RESOLVED: 'resolved',
    DISMISSED: 'dismissed',
  },

  // Friend Request Status
  FRIEND_REQUEST_STATUS: {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    BLOCKED: 'blocked',
  },

  // Message Status
  MESSAGE_STATUS: {
    SENT: 'sent',
    DELIVERED: 'delivered',
    READ: 'read',
  },

  // Stream Status
  STREAM_STATUS: {
    LIVE: 'live',
    ENDED: 'ended',
    ARCHIVED: 'archived',
  },

  // Streaming Platforms
  STREAMING_PLATFORMS: {
    TWITCH: 'twitch',
    YOUTUBE: 'youtube',
    FACEBOOK: 'facebook',
  },

  // Notification Types
  NOTIFICATION_TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
  },

  // Validation Rules
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 8,
    MIN_USERNAME_LENGTH: 3,
    MAX_USERNAME_LENGTH: 20,
    MIN_GAME_ID_LENGTH: 3,
    MAX_GAME_ID_LENGTH: 20,
    MIN_TOURNAMENT_NAME_LENGTH: 3,
    MAX_TOURNAMENT_NAME_LENGTH: 100,
    MIN_AMOUNT: 100,
    MAX_AMOUNT: 100000,
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
    DEFAULT_LIMIT: 50,
  },

  // Time
  TIME: {
    EMAIL_VERIFICATION_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours in ms
    PASSWORD_RESET_EXPIRY: 60 * 60 * 1000, // 1 hour in ms
    DISPUTE_WINDOW: 24 * 60 * 60 * 1000, // 24 hours in ms
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes in ms
  },

  // Prize Distribution (percentages)
  PRIZE_DISTRIBUTION: {
    FIRST_PLACE: 0.4,
    SECOND_PLACE: 0.3,
    THIRD_PLACE: 0.2,
    FOURTH_PLACE: 0.1,
  },

  // Currency
  CURRENCY: {
    DEFAULT: 'INR',
    SYMBOL: '₹',
  },

  // Platform Fees (in percentage)
  FEES: {
    PLATFORM_FEE: 0.1, // 10%
    PAYMENT_GATEWAY_FEE: 0.03, // 3%
    PAYOUT_FEE: 0.02, // 2%
  },

  // File Upload
  FILE_UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
    SCREENSHOT_TYPES: ['image/jpeg', 'image/png'],
  },

  // API Endpoints (relative)
  API_ENDPOINTS: {
    AUTH: '/api/auth',
    USERS: '/api/users',
    TOURNAMENTS: '/api/tournaments',
    REGISTRATIONS: '/api/registrations',
    PAYMENTS: '/api/payments',
    PAYOUTS: '/api/payouts',
    RESULTS: '/api/results',
    DISPUTES: '/api/disputes',
    FRIENDS: '/api/friends',
    MESSAGES: '/api/messages',
    STREAMS: '/api/streams',
    ANALYTICS: '/api/analytics',
    ADMIN: '/api/admin',
  },

  // Error Messages
  ERROR_MESSAGES: {
    INVALID_EMAIL: 'Invalid email address',
    INVALID_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, number and special character',
    INVALID_USERNAME: 'Username must be 3-20 characters (alphanumeric and underscore only)',
    INVALID_GAME_ID: 'Invalid Game ID format',
    INSUFFICIENT_FUNDS: 'Insufficient funds for this transaction',
    TOURNAMENT_FULL: 'This tournament is full',
    ALREADY_REGISTERED: 'You are already registered for this tournament',
    PAYMENT_FAILED: 'Payment processing failed. Please try again',
    NETWORK_ERROR: 'Network error. Please check your connection',
    SERVER_ERROR: 'Server error. Please try again later',
    UNAUTHORIZED: 'You are not authorized to perform this action',
    NOT_FOUND: 'Resource not found',
  },

  // Success Messages
  SUCCESS_MESSAGES: {
    SIGNUP_SUCCESS: 'Account created successfully',
    LOGIN_SUCCESS: 'Logged in successfully',
    LOGOUT_SUCCESS: 'Logged out successfully',
    REGISTRATION_SUCCESS: 'Tournament registration successful',
    PAYMENT_SUCCESS: 'Payment processed successfully',
    PROFILE_UPDATE_SUCCESS: 'Profile updated successfully',
    TOURNAMENT_CREATED: 'Tournament created successfully',
  },

  // Storage Keys
  STORAGE_KEYS: {
    USER: 'cod_user',
    AUTH_TOKEN: 'cod_auth_token',
    REFRESH_TOKEN: 'cod_refresh_token',
    PREFERENCES: 'cod_preferences',
    THEME: 'cod_theme',
  },
};

export default CONSTANTS;

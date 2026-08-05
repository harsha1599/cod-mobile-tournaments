module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    '**/*.js',
    '!node_modules/**',
    '!dist/**',
    '!coverage/**',
    '!jest.config.js',
    '!babel.config.js',
    '!vite.config.js',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@components/(.*)$': '<rootDir>/components/$1',
    '^@services/(.*)$': '<rootDir>/services/$1',
    '^@utils/(.*)$': '<rootDir>/utils/$1',
  },
  transformIgnorePatterns: ['node_modules/(?!(@supabase)/)'],
  testTimeout: 10000,
};

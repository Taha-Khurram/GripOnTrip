/**
 * Jest config for unit tests. Uses the `jest-expo` preset so Expo/RN modules and
 * TypeScript are transformed correctly, plus the `@/` path alias used app-wide.
 */
module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
};

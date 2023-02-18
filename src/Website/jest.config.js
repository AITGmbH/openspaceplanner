module.exports = {
  preset: 'jest-preset-angular',
  roots: ['<rootDir>/src/'],
  testMatch: ['**/+(*.)+(spec).+(ts)'],
  setupFilesAfterEnv: ['<rootDir>/src/test.ts'],
  collectCoverage: true,
  reporters: ['default', 'jest-junit'],
  coverageReporters: ['cobertura'],
  coverageDirectory: 'coverage/app'
};

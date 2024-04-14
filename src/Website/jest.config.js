const { defaultTransformerOptions } = require('jest-preset-angular/presets');

module.exports = {
  preset: 'jest-preset-angular',
  roots: ['<rootDir>/src/'],
  testMatch: ['**/+(*.)+(spec).+(ts)'],
  collectCoverage: false,
  reporters: ['default', 'jest-junit'],
  coverageReporters: ['cobertura'],
  coverageDirectory: 'coverage/app',
  coveragePathIgnorePatterns: ['node_modules'],
  transform: {
    '^.+\\.(ts|js|mjs|html|svg)$': [
      'jest-preset-angular',
      {
        ...defaultTransformerOptions,
        isolatedModules: true,
      },
    ],
  },
};

module.exports = {
  moduleFileExtensions: ['js', 'json'],

  transform: { '^.+\\.js?$': 'babel-jest' },

  transformIgnorePatterns: ['/node_modules/'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },

  testMatch: ['**/__tests__/*.js'],

  testURL: 'http://localhost/',

  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.js'],
  coveragePathIgnorePatterns: ['/src/run.js', '__fixtures__', '__tests__']
}

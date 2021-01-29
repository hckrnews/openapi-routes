module.exports = {
  moduleFileExtensions: ['js', 'cjs', 'mjs', 'jsx', 'json'],

  transform: {
    '^.+\\.js?$': 'babel-jest',
    '^.+\\.cjs?$': 'babel-jest',
    '^.+\\.mjs?$': 'babel-jest'
  },

  transformIgnorePatterns: ['/node_modules/'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },

  testMatch: ['**/__tests__/*.js'],

  testURL: 'http://localhost/',

  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.js', 'src/**/*.cjs', 'src/**/*.mjs']
}

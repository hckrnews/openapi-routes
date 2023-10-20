module.exports = {
  moduleFileExtensions: ['js', 'cjs', 'mjs', 'jsx', 'json'],

  transform: {
    '^.+\\.js?$': 'babel-jest',
    '^.+\\.mjs?$': 'babel-jest'
  },

  transformIgnorePatterns: ['node_modules/(?!(@hckrnews|@ponbike|@pondevelopment)/)'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },

  testMatch: ['**/__tests__/*.js'],

  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.js', 'src/**/*.cjs', 'src/**/*.mjs'],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60
    }
  },
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'test-reports',
      outputName: 'jest-junit.xml'
    }]
  ],

  testResultsProcessor: 'jest-sonar-reporter'
}

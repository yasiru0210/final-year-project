module.exports = {
    testEnvironment: 'node',
    transform: {
        '^.+\\.js$': 'babel-jest',
    },
    testMatch: ['**/tests/**/*.test.js'],
    verbose: true,
    setupFiles: ['./src/tests/setup.js'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    moduleFileExtensions: ['js', 'json'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
    }
}; 
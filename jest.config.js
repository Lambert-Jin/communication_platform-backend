module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  maxWorkers: 1,
  collectCoverage: true,
  coverageReporters: ["text", "lcov"],
};

module.exports = {
  moduleFileExtensions: ['js', 'jsx', 'json', 'vue'],
  transform: {
    '^.+\\.vue$': 'vue-jest',
    '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$':
      'jest-transform-stub',
    '^.+\\.jsx?$': '<rootDir>/node_modules/babel-jest',
  },
  moduleNameMapper: {
    '.*/en-US/.*\\.ftl$': '<rootDir>/tests/mocks/enUSfluentMock.js',
    '.*/abc/.*\\.ftl$': '<rootDir>/tests/mocks/abcfluentMock.js',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  snapshotSerializers: ['jest-serializer-vue'],
  testMatch: ['<rootDir>/**/*.spec.(js|jsx|ts|tsx)'],
};

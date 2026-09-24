/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { JestConfigWithTsJest } from 'ts-jest';


const moduleNameMapper = {
  '^@api$': '<rootDir>/src/utils/burger-api',
  '^@api/(.*)$': '<rootDir>/src/utils/burger-api/$1',
  '^@utils-types$': '<rootDir>/src/utils/types',
  '^@utils/(.*)$': '<rootDir>/src/utils/$1',
  '^@slices$': '<rootDir>/src/services/slices',
  '^@slices/(.*)$': '<rootDir>/src/services/slices/$1',
  '^@selectors$': '<rootDir>/src/services/selectors',
  '^@selectors/(.*)$': '<rootDir>/src/services/selectors/$1',
  '^@services$': '<rootDir>/src/services',
  '^@services/(.*)$': '<rootDir>/src/services/$1',
  '^@components$': '<rootDir>/src/components',
  '^@components/(.*)$': '<rootDir>/src/components/$1',
  '^@ui$': '<rootDir>/src/components/ui',
  '^@ui/(.*)$': '<rootDir>/src/components/ui/$1',
  '^@ui-pages$': '<rootDir>/src/components/ui/pages',
  '^@ui-pages/(.*)$': '<rootDir>/src/components/ui/pages/$1',
  '^@pages$': '<rootDir>/src/pages',
  '^@pages/(.*)$': '<rootDir>/src/pages/$1',
  '^@hocs$': '<rootDir>/src/hocs',
  '^@hocs/(.*)$': '<rootDir>/src/hocs/$1',
  '^@hooks$': '<rootDir>/src/hooks',
  '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
  '^@/(.*)$': '<rootDir>/src/$1',
};

const config: JestConfigWithTsJest = {
  testEnvironment: 'node',

  roots: ['<rootDir>/src'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/tests/'],
  moduleNameMapper,

  // Indicates that the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // An array of glob patterns indicating a set of files for which coverage should be collected
  collectCoverageFrom: ['src/services/slices/*.ts'],

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8',

  preset: 'ts-jest',
  transform: {
    // '^.+\\.[tj]sx?$' для обработки файлов js/ts с помощью `ts-jest`
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.test.json',
      },
    ],
  },
};

export default config;

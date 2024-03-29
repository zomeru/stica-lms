module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'next',
    'airbnb',
    'airbnb-typescript',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  plugins: ['@typescript-eslint', 'import'],
  settings: {
    next: {
      rootDir: ['apps/*/', 'packages/*/'],
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: ['apps/*/tsconfig.json'],
      },
    },
  },
  rules: {
    // react
    'react/function-component-definition': [
      2,
      {
        namedComponents: 'arrow-function',
      },
    ],
    'react/react-in-jsx-scope': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/function-component-definition': 'off',
    'react/require-default-props': 'off',
    'react/jsx-no-useless-fragment': 'off',

    'prefer-promise-reject-errors': 'off',
    'import/no-extraneous-dependencies': 'off',
    'arrow-body-style': 'off',
    'import/prefer-default-export': 'off',
    'no-nested-ternary': 'off',
    'no-else-return': 'off',
    'no-lonely-if': 'off',
    'import/no-cycle': 'off',
    'no-underscore-dangle': 'off',
    '@typescript-eslint/naming-convention': 'off',

    // next
    '@next/next/no-html-link-for-pages': 'off',
  },
  ignorePatterns: [
    '**/*.js',
    '**/*.json',
    'node_modules',
    'public',
    'styles',
    '.next',
    'dist',
    '.turbo',
  ],
};

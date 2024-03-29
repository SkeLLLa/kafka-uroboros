module.exports = {
  root: true,
  plugins: [
    'prettier',
    '@typescript-eslint/eslint-plugin',
    'eslint-plugin-tsdoc',
  ],
  extends: [
    'eslint:recommended',
    'google',
    'prettier',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
    ecmaVersion: 2020,
  },
  env: {
    es6: true,
    node: true,
    jest: false,
  },

  rules: {
    'new-cap': [
      'error',
      {
        capIsNewExceptions: ['ObjectId', 'Fastify'],
        capIsNewExceptionPattern: '^Type\\.',
      },
    ],
    'require-jsdoc': 'off',
    'valid-jsdoc': 'off',
    'tsdoc/syntax': 'error',
    'prettier/prettier': 'error',
    '@typescript-eslint/require-await': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/consistent-type-exports': 'error',
  },
};

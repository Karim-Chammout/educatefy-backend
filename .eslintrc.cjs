module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: ['airbnb-typescript/base', 'prettier'],
  plugins: ['prettier'],
  parserOptions: {
    project: './tsconfig.json',
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'import/extensions': 0,
    'import/no-extraneous-dependencies': 0,
    '@typescript-eslint/naming-convention': 0,
    'prettier/prettier': [
      'error',
      {
        semi: true,
        tabWidth: 2,
        printWidth: 100,
        singleQuote: true,
        bracketSameLine: false,
        trailingComma: 'all',
        arrowParens: 'always',
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        args: 'all',
        argsIgnorePattern: '^_',
        caughtErrors: 'all',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
  },
};

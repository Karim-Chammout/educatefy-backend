module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: ['airbnb-typescript/base', 'prettier'],
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
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
  },
};

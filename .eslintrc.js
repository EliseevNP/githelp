module.exports = {
  extends: '@bifot/eslint-config',
  rules: {
    'no-shadow': 'off',
    'no-console': 'off',
    'no-plusplus': 'off',
    'no-return-await': 'off',
    'no-await-in-loop': 'off',
    'no-async-promise-executor': 'off',
    'arrow-parens': ['error', 'as-needed'],
    'arrow-body-style': ['error', 'as-needed'],
  },
};

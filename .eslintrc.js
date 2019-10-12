module.exports = {
  extends: '@bifot/eslint-config',
  rules: {
    'no-shadow': 'off',
    'no-console': 'off',
    'no-plusplus': 'off',
    'no-async-promise-executor': 'off',
    'no-await-in-loop': 'off',
    'arrow-parens': ['error', 'as-needed'],
    'arrow-body-style': ['error', 'as-needed'],
    // 'max-len': 'off',
  },
};

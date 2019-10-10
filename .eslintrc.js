module.exports = {
  extends: '@bifot/eslint-config',
  rules: {
    'no-unused-expressions': 'off',
    'no-shadow': 'off',
    'no-console': 'off',
    'no-plusplus': 'off',
    'camelcase': 'off',
    'no-async-promise-executor': 'off',
    'no-await-in-loop': 'off',
    "no-control-regex": 'off',
    'arrow-parens': ['error', 'as-needed'],
    'max-len': 'off',
  },
};

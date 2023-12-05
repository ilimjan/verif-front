module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ['plugin:vue/essential', '@vue/standard'],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    indent: 'off',
    semi: 0,
    'prefer-const': 'off',
    'space-before-function-paren': 'off',
    'no-multiple-empty-lines': 'off',
    'spaced-comment': 'off',
    'object-curly-spacing': 'off',
    'no-trailing-spaces': 'off',
    'no-unused-vars': 'off',
    'dot-notation': 'off',
    'padded-blocks': 'off',
    'eol-last': 'off',
    'handle-callback-err': 'off'
  }
};

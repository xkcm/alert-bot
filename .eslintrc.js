module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'arrow-parens': ['warn', 'as-needed'],
    'max-len': ['error', { code: 200 }],
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'import/prefer-default-export': 'off',
    'quotes': ['error', 'single'],
  },
  ignorePatterns: [
    "build",
    ".eslintrc.js"
  ]
}

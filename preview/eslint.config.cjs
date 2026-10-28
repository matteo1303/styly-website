const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  globalIgnores(['dist/*', '.expo/*', 'src/domain/*.test.ts']),
  expoConfig,
  {
    rules: {
      'react/no-unescaped-entities': 'off',
    },
  },
]);

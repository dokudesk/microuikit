/** @type {import('vitest').UserConfig} */
export default {
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      reporter: [
        'text',
        'html',
        'lcov'
      ],
      include: ['dist/js/flexa.js'],
      exclude: [
        'node_modules/',
        'dist/css/',
        'dist/themes/',
        'docs/',
        'tests/',
        '**/*.test.js',
        '**/*.config.*'
      ],
    }
  }
};

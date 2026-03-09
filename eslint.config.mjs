// Flat ESLint config for Next.js 16 with ESLint 9+
import next from 'eslint-config-next';

export default [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'eslint.config.mjs',
    ],
  },
  ...next,
];

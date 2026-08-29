import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Pre-existing authoring copy and lesson content trip this constantly.
      // Ticket: Phase F copy pass — do not re-enable until F5.
      'react/no-unescaped-entities': 'off',
      // Hundreds of `any`s across studio/viewer. Ticket: Phase E shared contracts (E2).
      '@typescript-eslint/no-explicit-any': 'off',
      // React Compiler lint that fires on existing dashboard/viewer effects.
      // Ticket: Phase G / F1 a11y+effects cleanup — do not leave as error until then.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/error-boundaries': 'off',
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'scripts/**',
    'tmp_old_cue.tsx',
    'tmp_fix_quiz_ids.js',
    '_audit_count.js',
    '_lint_errors.js',
  ]),
])

export default eslintConfig

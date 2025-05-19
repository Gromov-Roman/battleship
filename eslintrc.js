module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint',
        'import',
        'node',
        'promise'
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'plugin:node/recommended',
        'plugin:promise/recommended'
    ],
    parserOptions: {
        project: ['./tsconfig.json'],
        ecmaVersion: 2022,
        sourceType: 'module'
    },
    settings: {
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts']
        },
        'import/resolver': {
            typescript: {
                alwaysTryTypes: true
            }
        },
        node: {
            tryExtensions: ['.js', '.json', '.ts']
        }
    },
    rules: {
        // Possible Errors
        'no-console': 'off', // Allow console for logging
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_'
        }],

        // Best Practices
        'complexity': ['warn', 15],
        'max-depth': ['warn', 4],
        'max-lines-per-function': ['warn', {
            max: 50,
            skipBlankLines: true,
            skipComments: true
        }],
        'no-await-in-loop': 'error',
        'no-return-await': 'error',
        'require-await': 'warn',

        // Style
        '@typescript-eslint/explicit-function-return-type': ['warn', {
            allowExpressions: true,
            allowTypedFunctionExpressions: true
        }],
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/ban-ts-comment': ['error', {
            'ts-ignore': 'allow-with-description',
            'ts-nocheck': 'allow-with-description'
        }],
        '@typescript-eslint/naming-convention': [
            'error',
            {
                selector: 'variable',
                format: ['camelCase', 'UPPER_CASE', 'PascalCase']
            },
            {
                selector: 'function',
                format: ['camelCase']
            },
            {
                selector: 'interface',
                format: ['PascalCase']
            },
            {
                selector: 'typeAlias',
                format: ['PascalCase']
            }
        ],

        // Import Rules
        'import/order': ['error', {
            groups: [
                'builtin',
                'external',
                'internal',
                ['parent', 'sibling'],
                'index'
            ],
            'newlines-between': 'always'
        }],
        'import/no-unresolved': 'error',
        'import/named': 'error',
        'import/default': 'error',
        'import/namespace': 'error',
        'import/no-absolute-path': 'error',
        'import/no-dynamic-require': 'error',
        'import/no-self-import': 'error',

        // Node.js specific
        'node/no-unsupported-features/es-syntax': ['error', {
            version: '>=22.0.0',
            ignores: ['modules']
        }],
        'node/file-extension-in-import': ['error', 'always', {
            '.ts': 'never',
            '.js': 'never'
        }],

        // Promise Rules
        'promise/always-return': 'error',
        'promise/no-return-wrap': 'error',
        'promise/catch-or-return': 'error',

        // Typescript-specific
        '@typescript-eslint/no-misused-promises': ['error', {
            checksVoidReturn: {
                attributes: false
            }
        }],
        '@typescript-eslint/consistent-type-definitions': ['error', 'interface']
    },
    overrides: [
        {
            files: ['*.test.ts', '*.test.js'],
            rules: {
                'max-lines-per-function': 'off',
                '@typescript-eslint/no-explicit-any': 'off',
                '@typescript-eslint/no-non-null-assertion': 'off'
            }
        }
    ]
};

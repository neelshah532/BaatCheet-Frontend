module.exports = {
    env: {
        browser: true,
        es2021: true,
        jest: true
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "plugin:prettier/recommended"
    ],
    overrides: [
        {
            env: {
                node: true
            },
            files: [
                ".eslintrc.{js,cjs,ts,tsx}"
            ],
            parser: "@typescript-eslint/parser",
            parserOptions: {
                sourceType: "script",
                project: "./tsconfig.json",
            }

        },
        {
            "files": ["*.js", "*.jsx", "*.ts", "*.tsx"],
            "rules": {
                "simple-import-sort/imports": [
                    "error",
                    {
                        "groups": [
                            // Packages `react` related packages come first.
                            ["^react", "^@?\\w"],
                            // Node.js builtins prefixed with `node:`.
                            ["^node:"],
                            // Internal packages.
                            ["^(@|components)(/.*|$)"],
                            // Side effect imports.
                            ["^\\u0000"],
                            // Parent imports. Put `..` last.
                            ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
                            // Other relative imports. Put same-folder imports and `.` last.
                            ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
                            // Style imports.
                            ["^.+\\.s?css$"]
                        ]
                    }
                ]
            }
        }
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        "ecmaVersion": "latest",
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": latest,
        "sourceType": "module",
        "project": "./tsconfig.json"
    },
    "plugins": ["react", "react-hooks", "import", "jsx-a11y", "simple-import-sort", "prettier", "@typescript-eslint"],
    "globals": {
        "React": true,
        "google": true,
        "mount": true,
        "mountWithRouter": true,
        "shallow": true,
        "shallowWithRouter": true,
        "context": true,
        "expect": true,
        "jsdom": true,
        "JSX": true
    },
    rules: {
        "comma-dangle": ["off", "never"],
        "react/react-in-jsx-scope": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "simple-import-sort/imports": "off",
        "simple-import-sort/exports": "error",
        "import/first": "error",
        "import/newline-after-import": "error",
        "import/no-duplicates": "error",
        "@typescript-eslint/triple-slash-reference": "off",
        "@typescript-eslint/no-unused-vars": "warn",
        "jsx-a11y/click-events-have-key-events": "off",
        "jsx-a11y/no-static-element-interactions": "off",
        "@typescript-eslint/strict-boolean-expressions": "off",
        "implicit-arrow-linebreak": "off",
        "@typescript-eslint/no-explicit-any": "off"
    },
    "settings": {
        "import/resolver": {
            "typescript": {}
        }
    }
}

module.exports = {
    "env": {
        "commonjs": true,
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018
    },
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "windows"
        ],
        "no-irregular-whitespace": [
            "off"
        ],
        "no-unused-vars": [
            "off"
        ],
        "no-useless-escape": [
            "off"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};
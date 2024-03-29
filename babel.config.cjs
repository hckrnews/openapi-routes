module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    node: true,
                },
            },
        ],
    ],
    plugins: ['@babel/plugin-transform-modules-commonjs', '@babel/syntax-import-assertions'],
};


module.exports = {
    plugins: [
        {
            name: 'preset-default',
            params: {
                overrides: {
                    removeViewBox: false,
                    mergePaths: {
                        force: true,
                        noSpaceAfterFlags: false,
                    },
                    convertShapeToPath: true,
                    convertPathData: {
                        floatPrecision: 2,
                    }
                },
            },
        },
        'removeDimensions',
        {
            name: 'sortAttrs',
        },
        {
            name: 'removeAttrs',
            params: {
                attrs: '(data-name|data-original|p-id)'
            }
        }
    ],
};

import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default [
    {
        input: 'src/MixpanelEventForwarder.js',
        output: {
            file: 'MixpanelEventForwarder.js',
            format: 'iife',
            exports: 'named',
            name: 'mpMixpanelKit',
            strict: false
        },
        plugins: [
            resolve({
                browser: true
            }),
            commonjs()
        ]
    },
    {
        input: 'src/MixpanelEventForwarder.js',
        output: {
            file: 'dist/MixpanelEventForwarder.js',
            format: 'iife',
            exports: 'named',
            name: 'mpMixpanelKit',
            strict: false
        },
        plugins: [
            resolve({
                browser: true
            }),
            commonjs()
        ]
    },
    {
        input: 'src/MixpanelEventForwarder.js',
        output: {
            file: 'npm/MixpanelEventForwarder.js',
            format: 'cjs',
            exports: 'named',
            name: 'mpMixpanelKit',
            strict: false
        },
        plugins: [
            resolve({
                browser: true
            }),
            commonjs()
        ]
    }
]
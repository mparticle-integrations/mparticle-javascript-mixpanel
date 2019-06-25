import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default [{
    input: 'src/MixpanelEventForwarder.js',
    output: {
        file: 'MixpanelEventForwarder.js',
       format: 'umd',
        exports: 'named',
        name: 'mp-mixpanel-kit',
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
        format: 'umd',
        exports: 'named',
        name: 'mp-mixpanel-kit',
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
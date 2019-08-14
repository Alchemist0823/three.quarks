import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import {uglify} from 'rollup-plugin-uglify'
import pkg from './package.json'

const extensions = [
    '.js', '.jsx', '.ts', '.tsx',
];

export default [
    {
        input: 'src/index.ts',
        output: [
            {
                file: pkg.main,
                format: 'cjs',
            },
            {
                file: pkg.module,
                format: 'es',
            },
        ],
        external: ['three'],
        plugins: [
            // Allows node_modules resolution
            resolve({ extensions }),

            // Allow bundling cjs modules. Rollup doesn't understand cjs
            commonjs(),

            // Compile TypeScript/JavaScript files
            babel({
                extensions,
                include: ['src/**/*'],
                runtimeHelpers: true,
            }),
        ],
    },
    {
        input: 'src/index.ts',
        output: [
            {
                file: pkg.browser_NO_NPM,
                format: 'iife',
                name: 'THREE.QUARKS',
                // the global which can be used in a browser
                // https://rollupjs.org/guide/en#output-globals-g-globals
                globals: {
                    'three': 'THREE',
                },
            }
        ],
        external: ['three'],
        plugins: [
            resolve({ extensions }),
            commonjs(),
            babel({
                extensions,
                include: ['src/**/*'],
                runtimeHelpers: true,
            }),
            uglify(),
        ],
    }
]
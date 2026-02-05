import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import ts from 'typescript';
import pkg from './package.json' with {type: 'json'};

const date = new Date().toDateString();

const banner = `/**
 * ${pkg.name} v${pkg.version} build ${date}
 * ${pkg.homepage}
 * Copyright ${date.slice(-4)} ${pkg.author}, ${pkg.license}
 */`;

const production = process.env.NODE_ENV === 'production';
const extensions = ['.js', '.jsx', '.ts', '.tsx'];

// External dependencies (not bundled)
const external = [
    'react',
    'react/jsx-runtime',
    'three',
    '@react-three/fiber',
    'three.quarks',
    'quarks.core'
];

export const lib = {
    main: {
        input: './src/index.ts',
        external,
        plugins: [
            nodeResolve({
                extensions,
            }),
            commonjs({
                include: 'node_modules/**',
                ignoreGlobal: false,
            }),
            typescript({
                typescript: ts,
                declaration: true,
            }),
        ],
        output: [
            {
                file: pkg.exports['.'].require,
                format: 'cjs',
                banner,
            },
            {
                file: pkg.module,
                format: 'es',
                banner,
            },
        ],
    },
};

export default [lib.main];

import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser';
import pkg from './package.json' with {type: 'json'};
import typescript from '@rollup/plugin-typescript';
import ts from 'typescript';

const date = new Date().toDateString();

const banner = `/**
 * ${pkg.name} v${pkg.version} build ${date}
 * ${pkg.homepage}
 * Copyright ${date.slice(-4)} ${pkg.author}, ${pkg.license}
 */`;

const production = process.env.NODE_ENV === 'production';
const globals = {};
const extensions = ['.js', '.jsx', '.ts', '.tsx'];

export const lib = {
    main: {
        input: 'src/index.ts',
        external: Object.keys(globals),
        plugins: [
            //wgslPlugin(),
            nodeResolve({
                extensions: extensions,
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
                name: pkg.name.replace(/-/g, '').toUpperCase(),
                globals,
                banner,
            },
            {
                file: pkg.module,
                format: 'esm',
                globals,
                banner,
            },
        ],
    },
};
export default [lib.main];

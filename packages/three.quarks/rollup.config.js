import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
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
const globals = {three: 'THREE', 'three.quarks': 'THREE.QUARKS'};
const extensions = ['.js', '.jsx', '.ts', '.tsx'];

function wgslPlugin() {
    return {
        name: 'wgsl-plugin',
        transform(code, id) {
            if (id.endsWith('.wgsl')) {
                return {
                    code: `export default \`${code}\`;`,
                    map: {mappings: ''},
                };
            }
        },
    };
}

export const lib = {
    main: {
        input: './src/index.ts',
        external: ['three', 'quarks.core'],
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
                format: 'es',
                name: pkg.name,
                globals,
                banner,
            },
        ],
    },
    browser: {
        input: './src/index.ts',
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
            babel({
                extensions,
                include: ['src/**/*'],
                babelHelpers: 'bundled',
            }),
        ],
        output: [
            {
                file: pkg.main,
                format: 'umd',
                name: pkg.name.replace(/-/g, '').toUpperCase(),
                globals,
                banner,
            },
        ],
    },
    min: {
        input: pkg.main,
        external: Object.keys(globals),
        plugins: [
            terser({
                keep_classnames: true,
                keep_fnames: true,
            }),
        ],
        output: [
            {
                file: pkg.module.replace('.js', '.min.js'),
                format: 'esm',
                globals,
                banner,
            },
            {
                file: pkg.main.replace('.js', '.min.js'),
                format: 'umd',
                name: pkg.name.replace(/-/g, '').toUpperCase(),
                globals,
                banner,
            },
        ],
    },
};
export default production ? [lib.main, lib.browser, lib.min] : [lib.main];

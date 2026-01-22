import resolve from '@rollup/plugin-node-resolve';
//import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import pkg from './package.json' with {type: 'json'};

const date = new Date().toDateString();

const banner = `/**
 * ${pkg.name} v${pkg.version} build ${date}
 * ${pkg.homepage}
 * Copyright ${date.slice(-4)} ${pkg.author}, ${pkg.license}
 */`;

const production = process.env.NODE_ENV === 'production';
const globals = {three: 'THREE'};
const extensions = ['.js', '.jsx', '.ts', '.tsx'];

function wgslPlugin() {
    return {
        name: 'wgsl-plugin',
        transform(code, id) {
            if (id.endsWith('.wgsl')) {
                return {
                    code: `export default \`${code}\`;`,
                    map: { mappings: '' },
                };
            }
        },
    };
}
export const lib = {
    main: {
        input: 'src/index.ts',
        external: Object.keys(globals),
        plugins: [
            //wgslPlugin(),
            resolve({
                extensions: extensions,
                customResolveOptions: {
                    moduleDirectories: ['src'],
                },
            }),
            babel({
                extensions,
                include: ['src/**/*'],
                babelHelpers: 'bundled',
                //runtimeHelpers: true,
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
export default production ? [lib.main, lib.min] : [lib.main];

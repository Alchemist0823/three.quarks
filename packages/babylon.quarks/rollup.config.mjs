import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

const production = process.env.NODE_ENV === 'production';

export default {
    input: 'src/index.ts',
    output: [
        {
            file: 'dist/babylon.quarks.esm.js',
            format: 'esm',
            sourcemap: true,
        },
        {
            file: 'dist/babylon.quarks.cjs',
            format: 'cjs',
            sourcemap: true,
        },
    ],
    external: ['@babylonjs/core', /^@babylonjs\/core\/.*/],
    plugins: [
        resolve(),
        commonjs(),
        typescript({
            tsconfig: './tsconfig.json',
            declaration: false,
            declarationDir: undefined,
        }),
        production && terser(),
    ].filter(Boolean),
};

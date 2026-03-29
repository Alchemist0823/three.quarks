import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 8000,
    },
    preview: {
        port: 8000,
    },
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                vanilla: resolve(__dirname, 'vanilla.html'),
                r3f: resolve(__dirname, 'r3fDemo.html'),
                // webgpu.html uses import maps and is not bundled
            },
        },
    },
});

#!/usr/bin/env node
/**
 * Builds a static, bundler-free showcase of the examples (WebGL demos, WebGPU demos, benchmark)
 * that runs from any static file server. three.js is loaded from a CDN through an import map and the
 * locally built three.quarks bundles are copied to `lib/`.
 *
 *   node scripts/build-showcase.mjs [outDir]
 *
 * Requires `npm run build` for quarks.core and three.quarks first.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const examples = path.resolve(here, '..');
const packages = path.resolve(examples, '..');
const outDir = path.resolve(process.argv[2] ?? path.join(examples, 'showcase-dist'));

const THREE_VERSION = JSON.parse(fs.readFileSync(path.join(packages, '..', 'node_modules', 'three', 'package.json'), 'utf8')).version;
const CDN = `https://cdn.jsdelivr.net/npm/three@${THREE_VERSION}`;

const importMap = {
    imports: {
        three: `${CDN}/build/three.module.js`,
        'three/webgpu': `${CDN}/build/three.webgpu.js`,
        'three/tsl': `${CDN}/build/three.tsl.js`,
        'three/examples/jsm/': `${CDN}/examples/jsm/`,
        'three/addons/': `${CDN}/examples/jsm/`,
        'quarks.core': './lib/quarks.core.esm.js',
        'three.quarks': './lib/three.quarks.esm.js',
        'three.quarks/webgpu': './lib/three.quarks.webgpu.esm.js',
        // published baseline used by the benchmark ("webgl-legacy")
        'three.quarks-legacy': 'https://cdn.jsdelivr.net/npm/three.quarks@0.17.1/dist/three.quarks.esm.js',
    },
};

function copy(src, dst) {
    fs.mkdirSync(path.dirname(dst), {recursive: true});
    fs.copyFileSync(src, dst);
}

function copyDir(src, dst) {
    for (const entry of fs.readdirSync(src, {withFileTypes: true})) {
        const s = path.join(src, entry.name);
        const d = path.join(dst, entry.name);
        if (entry.isDirectory()) copyDir(s, d);
        else copy(s, d);
    }
}

function processHtml(source, scriptRename = {}) {
    let html = fs.readFileSync(source, 'utf8');
    // drop analytics of the hosted demo site
    html = html.replace(/\s*<!-- Google tag \(gtag\.js\) -->[\s\S]*?<\/script>\s*<script>[\s\S]*?<\/script>/, '');
    html = html.replace(/<link rel="manifest"[^>]*>\s*/, '');
    const map = `<script type="importmap">\n${JSON.stringify(importMap, null, 4)}\n</script>`;
    html = html.replace(/<head>/, `<head>\n${map}`);
    for (const [from, to] of Object.entries(scriptRename)) html = html.split(from).join(to);
    return html;
}

// empty (not delete) the output directory so a static server may keep serving it
fs.mkdirSync(outDir, {recursive: true});
for (const entry of fs.readdirSync(outDir)) fs.rmSync(path.join(outDir, entry), {recursive: true, force: true});

// libraries
copy(path.join(packages, 'quarks.core', 'dist', 'quarks.core.esm.js'), path.join(outDir, 'lib', 'quarks.core.esm.js'));
copy(path.join(packages, 'three.quarks', 'dist', 'three.quarks.esm.js'), path.join(outDir, 'lib', 'three.quarks.esm.js'));
copy(
    path.join(packages, 'three.quarks', 'dist', 'three.quarks.webgpu.esm.js'),
    path.join(outDir, 'lib', 'three.quarks.webgpu.esm.js')
);

// example sources (plain ES modules)
for (const file of fs.readdirSync(examples)) {
    if (file.endsWith('.js') && file !== 'vite.config.js' && file !== 'webgpu.js' && file !== 'nodeBasedVFXDemo.js') {
        let js = fs.readFileSync(path.join(examples, file), 'utf8');
        if (file === 'main.js' || file === 'main-webgpu.js') {
            js = js.replace(/const GITHUB_BASE = '[^']*';/, "const GITHUB_BASE = 'https://github.com/Alchemist0823/three.quarks/blob/master/packages/quarks.examples/';");
        }
        fs.writeFileSync(path.join(outDir, file), js);
    }
}

// pages
fs.writeFileSync(path.join(outDir, 'webgl.html'), processHtml(path.join(examples, 'vanilla.html')));
fs.writeFileSync(path.join(outDir, 'webgpu.html'), processHtml(path.join(examples, 'vanilla-webgpu.html')));
fs.writeFileSync(path.join(outDir, 'benchmark.html'), processHtml(path.join(examples, 'benchmark.html')));

// static assets
copyDir(path.join(examples, 'public'), outDir);

// optional report / landing page
const report = path.join(examples, 'showcase', 'index.html');
if (fs.existsSync(report)) {
    fs.writeFileSync(path.join(outDir, 'index.html'), processHtml(report));
}

console.log(`showcase written to ${path.relative(process.cwd(), outDir)} (three@${THREE_VERSION})`);

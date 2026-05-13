#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const targetDir = path.resolve(process.argv[2] ?? 'dist/types');

if (!fs.existsSync(targetDir)) {
    console.error(`fix-dts-extensions: ${targetDir} does not exist`);
    process.exit(1);
}

const walk = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
        const p = path.join(dir, d.name);
        return d.isDirectory() ? walk(p) : [p];
    });

let fixed = 0;
for (const file of walk(targetDir).filter((f) => f.endsWith('.d.ts'))) {
    const dir = path.dirname(file);
    const original = fs.readFileSync(file, 'utf8');
    const next = original.replace(
        /(from\s+['"])(\.[^'"]+)(['"])/g,
        (_, pre, spec, post) => {
            if (fs.existsSync(path.join(dir, `${spec}.d.ts`))) {
                return `${pre}${spec}.js${post}`;
            }
            const idxRel = spec.endsWith('/') ? `${spec}index.d.ts` : `${spec}/index.d.ts`;
            if (fs.existsSync(path.join(dir, idxRel))) {
                return `${pre}${spec}${spec.endsWith('/') ? '' : '/'}index.js${post}`;
            }
            return `${pre}${spec}${post}`;
        },
    );
    if (next !== original) {
        fs.writeFileSync(file, next);
        fixed++;
    }
}

console.log(`fix-dts-extensions: rewrote ${fixed} file(s) in ${path.relative(process.cwd(), targetDir)}`);

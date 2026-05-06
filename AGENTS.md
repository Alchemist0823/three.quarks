# AGENTS.md

## Cursor Cloud specific instructions

This is a TypeScript monorepo (npm workspaces) for **three.quarks**, a particle system library for three.js.

### Project structure

- `packages/quarks.core` — Core library (zero deps, framework-agnostic)
- `packages/three.quarks` — Main package (depends on quarks.core + three.js)
- `packages/quarks.r3f` — React Three Fiber wrapper
- `packages/quarks.nodes` — Experimental node-based VFX with WebGPU
- `packages/quarks.examples` — Interactive demos (Vite, port 8000)
- `packages/quarks.playground` — Dev sandbox (Vite, port 8001)

### Key commands

| Action | Command |
|--------|---------|
| Install deps | `npm install` (from root) |
| Build all | `npm run build` |
| Test all | `npm test` |
| Run examples dev server | `npm run examples` (port 8000) |
| Run playground dev server | `npm run playground` (port 8001) |
| Prettier check | `npx prettier --check "packages/*/src/**/*.ts"` |

### Non-obvious notes

- **ESLint config**: The project has `.eslintrc` files in packages but ESLint 9 installed at root. You must use `ESLINT_USE_FLAT_CONFIG=false` to run ESLint with legacy config. There's also a known issue with `unused-imports/no-unused-imports-ts` rule name (renamed in plugin v4+).
- **Build order matters**: `quarks.core` must build before `three.quarks`, which must build before other packages. The root `npm run build` handles this automatically.
- **No backend/database/Docker needed**: This is purely a client-side library project. All services are build/dev tooling.
- **Husky pre-commit hook**: Runs `lint-staged` (prettier on staged `.ts` files).
- **Node.js requirement**: The project needs Node.js 22+ (uses modern ESM features).

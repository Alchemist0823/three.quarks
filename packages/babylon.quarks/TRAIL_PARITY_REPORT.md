# Trail Parity Report

## Scope

Trail parity work in:

- `packages/babylon.quarks/src/TrailBatch.ts`
- `packages/babylon.quarks/src/shaders/trail_vert.glsl.ts`
- `packages/babylon.quarks/src/shaders/trail_frag.glsl.ts`
- `packages/quarks.examples/babylon/demos/trail.babylon.js`

## Implemented changes

- Wired full trail attributes (`previous`, `next`, `side`, `width`) from CPU buffers to shader attributes.
- Updated trail vertex shader to camera-facing ribbon expansion using previous/current/next segment direction.
- Added runtime resolution refresh (`onBindObservable`) to avoid incorrect aspect in resized viewports.
- Applied material render-state policy in trail batch:
  - transparent vs opaque alpha mode,
  - depth write prepass/write toggles based on renderer settings.
- Aligned Babylon trail demo parameters closer to Three reference:
  - burst-based emission,
  - world-space trail,
  - force intensity,
  - color-over-life gradient style.

## Build and lint results

- `npm run build --workspace=babylon.quarks` - Pass
- `npm run build --workspace=quarks.examples` - Pass
- lint diagnostics on edited trail files - Pass

## Remaining manual visual checks

- side-by-side Three vs Babylon join behavior on sharp direction changes,
- near-camera aliasing/thickness consistency,
- long-run stability (no trail tearing or sudden flips).

# Trail Parity Checklist

Reference targets:

- `packages/three.quarks/src/TrailBatch.ts`
- `packages/quarks.examples/demos/three/trailDemo.js`

## Visual checklist

- Ribbon width remains stable along trail length.
- Trail keeps camera-facing orientation without sudden flips.
- Sharp turns do not create tearing at segment joins.
- UV tiling remains continuous across segments.
- Color over life matches gradient behavior (red-to-green range).
- Fade/alpha behavior is consistent and does not hard-pop.

## Behavior checklist

- `RenderMode.Trail` uses `startLength` from `rendererEmitterSettings`.
- Burst emission produces immediate visible ribbons (`count=100`).
- Gravity force bends trail over time.
- World-space trail behavior matches Three demo.

## Stability checklist

- No geometry explosions with close camera.
- No NaN artifacts when velocity is near-zero.
- No severe performance degradation during long run.

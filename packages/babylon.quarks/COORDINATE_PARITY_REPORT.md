# Coordinate Parity Report (Three vs Babylon)

## Scope

Coordinate-system parity implementation for:

- `packages/babylon.quarks` core loader/shader pipeline
- `packages/quarks.examples` Babylon runtime and parity-sensitive demos

## Implemented

1. Coordinate contract documented:
   - `COORDINATE_CONTRACT.md` defines RH parity policy and transform ownership.
2. Loader matrix decomposition fixed:
   - `QuarksLoader` now decomposes `matrix` into translation + quaternion + scale.
   - Added support for explicit `quaternion` parsing in object path.
3. Shader transform parity updates:
   - billboard path uses `view * world * offset` for consistent model/world transform handling.
   - stretched billboard path now transforms position and velocity through `world`+`view`.
4. Runtime handedness sync:
   - `babylonMain` now enables `scene.useRightHandedSystem = true`.
5. Demo-level alignment updates:
   - `EmitterShapeDemo` layout/rotation updated to match Three framing and orientation.
   - `TurbulenceDemo` shape/rotation/rates/position aligned with Three source.
   - `FollowObjectDemo` trajectory scale and camera-follow behavior aligned.
   - `SequencerDemo` spawn shape switched to grid parity configuration.
   - `ExplosionDemo` lifecycle switched from forced continuous looping to timer-based one-shot respawn parity.
   - `SubEmitterDemo` no longer overrides source looping and now mirrors reference placement/scale.

## Validation

- `npm run build --workspace=babylon.quarks` - Pass
- `npm test --workspace=babylon.quarks` - Pass
- `npm run build --workspace=quarks.examples` - Pass
- IDE lint diagnostics on edited files - Pass

## Added tests

- `test/QuarksLoader.test.ts`
  - Verifies TRS preservation from imported matrix (position, quaternion, scale).

## Residual manual QA

Visual side-by-side checks still required in browser for final acceptance:

- exact emitter orientation in all demo keys after RH runtime switch,
- stretched billboard direction under parent rotation+scale,
- trajectory/framing match for follow-camera and complex emitters.

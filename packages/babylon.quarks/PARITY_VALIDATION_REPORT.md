# Babylon Parity Validation Report

## Scope

Validation after core parity fixes across:

- `packages/babylon.quarks/src/*`
- `packages/quarks.examples/babylon/*`

## Automated checks

- `npm run build --workspace=babylon.quarks` - Pass
- `npm run build --workspace=quarks.examples` - Pass
- IDE lints on edited paths - Pass

## Core parity checks completed

- Trail shader path now consumes `previous/next/side/width` attributes.
- Soft particles depth texture pipeline wired through renderer -> batch -> shader uniforms.
- Batch equality expanded with depth/alpha state fields.
- Billboard defines (`VERTICAL`, `HORIZONTAL`) and tile blending define (`TILE_BLEND`) wired in sprite path.
- Stretched billboard shader math aligned to Three-style velocity formulation.
- `MeshSurfaceEmitterPlugin` auto-loaded on package init.
- Loader now forwards depth/alpha settings and links mesh-surface emitter references by UUID.

## Demo fallback removal status

- `SoftParticleDemo` - switched to real soft-particle path (`softParticles`, depth renderer map).
- `CustomPluginDemo` - switched to runtime `loadPlugin` behavior registration.
- `SequencerDemo` - switched to `TextureSequencer` + `ApplySequences`.
- `EmitterShapeDemo` - labels implemented via dynamic texture planes.

## Strict side-by-side protocol (per demo key)

Check each demo at fixed timestamps `t=0.1, 0.5, 1.0, 2.0` with matched camera pose:

- emitter position/orientation,
- burst cadence and loop/restart timing,
- force/velocity direction,
- camera framing and subject scale,
- blend/fade behavior.

## Current pass/fail snapshot

- `PASS`: MuzzleFlash, EmitterShape, Trail, Sequencer, Turbulence, AlphaTest, CustomPlugin, FollowObject.
- `NEEDS_VISUAL_RECHECK`: Explosion (after lifecycle fix), Billboard, SoftParticle, CustomBlending, MeshMaterial, SubEmitter.

Remaining items are visual acceptance checks and cannot be fully proven by static/build validation only.

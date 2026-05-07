# Babylon vs Three Parity Baseline

This baseline tracks strict visual parity targets against the reference `three.quarks` demos.

## Canonical Contract

- Coordinate source of truth: Right-Handed world space parity with Three.
- Transform parsing: full TRS (`position + rotationQuaternion + scaling`) for imported matrices.
- Timing parity: burst/lifecycle behavior must mirror Three demo cadence (including refresh/re-spawn model).
- Material parity: depth/blend/alpha/render-order must match source JSON or Three config.

## Demo Matrix

| Demo key | Three reference behavior | Babylon current status | Delta to close |
| --- | --- | --- | --- |
| `MuzzleFlashDemo` | grouped cyclic restart cadence | aligned | verify group cadence/frame pacing |
| `ExplosionDemo` | one-shot burst systems, respawned by demo timer | mismatch observed | remove forced looping, mirror timer-driven respawn |
| `EmitterShapeDemo` | same shape set + same world layout and labels | aligned | verify camera framing strictness |
| `TrailDemo` | ribbon trail extrusion + world motion parity | mostly aligned | validate extreme angles/width joins |
| `SequencerDemo` | `TextureSequencer` + `ApplySequences` on grid spawn | aligned | verify sequence timing windows |
| `MeshMaterialDemo` | mesh material response + environment | close | verify env/material response parity |
| `SubEmitterDemo` | loader-driven nested emitters | close | remove forced loop override, use source lifecycle |
| `TurbulenceDemo` | cone + noise field, same orientation/cadence | aligned | verify long-run drift |
| `AlphaTestDemo` | alpha-cut mesh particles | aligned | verify threshold/depth edge cases |
| `CustomPluginDemo` | runtime plugin path | aligned | verify deterministic phase parity |
| `BillboardDemo` | horizon/vertical/stretched mode comparison | close | verify axis parity under RH runtime |
| `SoftParticleDemo` | depth-based soft fade + blend tiles | close | verify fade curve against stacked geometry |
| `CustomBlendingDemo` | custom blend-function behavior | close | verify blend factors in side-by-side capture |
| `FollowObjectDemo` | moving-parent follow + camera sync | aligned | verify trajectory/camera temporal lock |

## Cross-Cutting Gaps To Track

- Effect lifecycle parity (`looping`, `autoDestroy`, respawn timing) for loader-based demos.
- Remaining strict-visual validation with fixed timestamps per demo key.

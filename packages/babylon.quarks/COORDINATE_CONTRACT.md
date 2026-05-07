# Coordinate Contract (Babylon parity mode)

This package follows a parity-first coordinate contract with `three.quarks`:

- Runtime scenes for examples should use **Right-Handed** coordinates.
- Particle transform data is treated as:
  - emitter/world matrices in right-handed world space,
  - renderer batches consuming already-world-space particle attributes.
- Loader matrix parsing must preserve full TRS decomposition:
  - translation,
  - rotation quaternion,
  - scale.

## Rules

1. Do not mix RH and LH conversion strategies in one pipeline.
2. If examples use RH scenes, core math/shader paths should not apply extra axis flips.
3. JSON import path must preserve orientation (rotation cannot be dropped).
4. Demo-level overrides should only tune visual framing, not compensate for core axis bugs.

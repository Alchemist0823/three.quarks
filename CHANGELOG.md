# Change Log

## Version 0.18.0

- Add `three.quarks/webgpu`: batch renderer for three.js `WebGPURenderer`, built on TSL node materials (also runs on the WebGL2 fallback backend)
  - Supports every render mode (billboard, vertical, horizontal, stretched, mesh, trail), lit mesh particles (`MeshStandardMaterial` / `MeshPhysicalMaterial`), sprite sheets with frame blending, alpha test, custom blending, layers and render order
  - Soft particles read the framebuffer depth automatically, so the depth pre-pass WebGL needs is gone (`setDepthTexture` is still supported)
  - `desktop` / `mobile` / `auto` performance profiles (`new BatchedRenderer({target})`), `setProfile()` at runtime, `getRecommendedRendererSettings()`
  - `colorSpaceMode: 'webgl-compatible' | 'linear'`
- Refactor: renderer-agnostic `BaseBatchedRenderer`, `BaseSpriteBatch` and `BaseTrailBatch` hold the shared CPU code; the WebGL and WebGPU batches only build materials
- Performance (both renderers): all per-instance data of a batch lives in one interleaved buffer, so each frame uploads 1 buffer instead of 5–6 (sprites) and 2 instead of 8 (trails). Trails use 16-bit indices while they fit. The fill loop writes typed arrays directly, with no per-frame allocations. Batch fill is 1.1–2.7× faster.
- Fix lit mesh particles on three.js r187+: use three's own `meshphysical` fragment shader instead of a copy (`cube_uv_reflection_fragment` was removed)
- `QuarksProvider` (quarks.r3f) accepts `createBatchedRenderer` so you can supply the WebGPU batch renderer
- Upgrade three.js to 0.187.0; Jest now transforms three's ESM-only build
- Examples: WebGPU demo page (`vanilla-webgpu.html`), benchmark page (`benchmark.html`), static showcase builder; vendor the helvetiker font (no longer shipped by three)
- WebGPU: trails upload one 48-byte storage-buffer record per point and are expanded by vertex index (no index buffer, about 3x less upload), and their bounding sphere follows the trail every frame (from PR #115)
- WebGPU: per-batch values are read through `materialReference()`, so batches of the same kind share one node graph and one shader build. Building 50 distinct batches took 97-111 ms instead of 329-373 ms (from PR #115)
- WebGPU: lit mesh particles tile every 2D texture, normal maps included, through a material UV context (from PR #115)
- WebGPU: optional `QuarksCompositor` blends transparent particles in a display-space target, identical to WebGLRenderer
- WebGPU: optional `halfFloat` profile switch packs color / size / velocity as float16 (opt-in; slower on desktop Chrome)
- WebGPU: work around three r187's validation error for still-loading CubeTexture env maps; new batches draw nothing until filled, and rebuilt batches refill immediately
- Fix the emitter shape demo: sprites are billboards again (camera facing); only `RenderMode.Mesh` particles take the emitter shape's orientation
- Examples: React 19 + React Three Fiber 9 + drei 10; the R3F demo runs on WebGPURenderer with `?renderer=webgpu`; benchmark A/B mode against a baseline build (`build-showcase.mjs --prev <dist>`)

## Version 0.17.1

- Emit ESM/NodeNext-compatible `.d.ts` files so consumers on `moduleResolution: "nodenext"` resolve types cleanly (#108, thanks @regnaio)
- Fix emitter shapes overwriting `startRotation`; `Point`/`Sphere`/`Hemisphere`/`Donut`/`Rectangle` now only apply their default facing when rotation is still identity
- Fix `PointEmitter` always producing identity rotation (`lookAt` ran against just-zeroed position; now uses velocity)
- Fix `EmitterShapeDemo` font load by switching to a Vite `?url` import
- Resolve remaining transitive vulnerabilities 
- Add `RandomQuatGenerator` tests and document the `GeneratorMemory` slot pattern

## Version 0.17.0

- Add quarks.r3f package for React Three Fiber integration
  - Declarative `<ParticleSystem>` component with flexible props API
  - `<QuarksEffect>` component for loading JSON effects with Suspense support
  - `<QuarksProvider>` context for managing BatchedRenderer
  - Hooks: `useQuarks`, `useParticleSystem`, `useQuarksEffect`
- Add WebGPU shader support for next-gen rendering
- Upgrade Three.js from 0.165.0 to 0.182.0
- Move examples to quarks.examples package for better organization
- Add Jest mock for WGSL shader files
- Improve Vite build configuration

## Version 0.16.0

- Add QuarksPrefab class to manage lifecycle of animations and effects
- Fix uv attributes issue on InstancedGeometry
- Make visible property in Object3D works
- Fix a emitter shape bug and add rectangle emitter

## Version 0.15.7

- Fix trail renderer's side buffer bug where it only rendered the trail on the wrong side.
- Fix particle system behavior deserialization bug where it crashes when the behavior type doesn't exist.
- Add playground to drag and drop particle system json file.

## Version 0.15.6

- Make particle rotation aligns with velocity on emitter shapes

## Version 0.15.5

- Fix stretched billboard settings are not cloned in clone function

## Version 0.15.4

- Fix 1 frame lag bug when parent entity of a particle system is moved
- Added support for customized blend function
- Added particleDied event

## Version 0.15.3

- Support event listeners on particle system

## Version 0.15.1

- Introduce QuarksUtils to provide utility functions
- Update README and examples with QuarksUtils

## Version 0.15.0

- Support Vector3Generator
- Support 3d Start Size, 3d Particle Size.
- Support Rotation over 180 degrees per second.

## Version 0.14.1

- Fix OrbitOverLife behavior fails on memorization

## Version 0.14.0

- Split Three.quarks package to quarks.core, quarks.nodes, three.quarks
  - quarks.core: It's decoupled from three.js. it includes math library, core classes, functions, emitter and behaviors
  - quarks.nodes: It includes the next-gen node-based VFX system and WebGPU renderer
  - three.quarks: It integrates the core library with three.js renderer
- Add support for depthTest in Material

## Version 0.13.1

- Fully support MeshStandardMaterial's properties such as envMap on particles.

## version 0.13.0

- Fix the Rotation3dOverLife behavior doesn't work on mesh particle bug
- Refactor function/value generator system to support memorization

## version 0.12.3

- Fix package json exports field

## version 0.12.2

- Support burst emission on emitter shape
- Upgrade three.js to 0.165.0
- Fix the ForceOverLife behavior doesn't apply global force when particles are in local space.
- Fix mesh render mode quaternion multiplication order

## version 0.12.1

- Fix bug on blend tile shader when uv tile is not used
- Fix soft particle example bug

## version 0.12.0

- Support soft particles
- Support uv blend tiles.

## version 0.11.2

- Fix Major bug: particles are emitted at incorrect positions at first time
- Support loop / ping-pong emitting mode from emitter shapes

## version 0.11.1

- hotfix to support editors noise
- hotfix on rotation over life on mesh emitter

## version 0.11.0

- Make rotation over life auto-detect input function
- Make color range matches unity random color
- Three js version update and type improvement

## version 0.10.18

- Fix sub emitter emission over distance

## version 0.10.17

- Fix stretched Billboard shader so it rotates billboard correctly
- Add euler order option in eular generator, because threejs uses intrinsic eular angles, and unity
uses extrinsic eular angles.

## version 0.10.16

- Hot fix frame over life

## version 0.10.15

- Fix interval value on frame over life
- Better support for noise generation

## version 0.10.14

- Add support for length scale for StretchedBillboard renderer
- Fix EmitSubParticleSystem behavior's bug and support unity subEmitter module
- Add sub emitter example

## version 0.10.13

- Add support for more emitter shapes (circle, hemisphere) and shapes example

## version 0.10.12

- failed publish

## version 0.10.11

- Add support for count function on burst emission

## version 0.10.9

- Add LimitSpeedOverLife behavior
- Fix some behavior's configuration so it matches unity
- update node graph demo and definitions

## version 0.10.8

- Support horizontal and vertical billboard in shader

## version 0.10.6

- fix render setting reference bug
- fix shaders can not loaded in some loader because of shader chunk reference

## version 0.10.5

- Support alpha test / alpha clip / depth test on all material
- Fix uv mapping on mesh standard / physics material
- Support normal map

## Version 0.10.4

- Make three js peer dependencies

## Version 0.10.3

- Fix bugs caused by three.js version upgrade

## Version 0.10.0

- Support BSDF material MeshStandardMaterial and MeshBasicMaterial (Unlit)
- Move texture, blend, transparent, side, and other material related setting to material properties in particle system

## Version 0.9.0

- Decouple QuarksLoader from batchRenderer. Remove BatchRenderer in QuarksLoader constructor
- Fix many bugs involving scale of the particle system
- Refactor many code names involving particle to VFX.
- Add texture sequencer behavior
- Add grid emitter

## Version 0.8.0

- Add WIP node-based behavior
- Support sub-emission system
- Support mesh surface emitter

## Version 0.7.0

- Remove update(delta) function on individual particle systems.
Users do not need to call this function anymore manually. Add delta
parameter to BatchedParticleRenderer, which updates all registered
particle systems.
- Add a new behavior EmitSubParticleSystem, which emit a new particle emitter
from a particle in the current system.
- Fix MeshSurfaceEmitter's index bug.

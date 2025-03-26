# Change Log

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

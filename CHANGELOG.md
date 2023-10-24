# Change Log

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

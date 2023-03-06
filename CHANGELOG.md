# Change Log

## Version 0.10.0
- Support bsdf materinal MeshStandardMaterial and MeshBasicMaterial (Unlit)
- Move to handle texture, blend, transparent, side and other material related setting to material property in particle system

## Version 0.9.0
- Decouple QuarksLoader from batchRenderer. Remove BatchRenderer in QuarksLoader constructor
- Fix many bugs involves scale of particle system
- Refactor many names involves particle to VFX.
- Add texture sequencer behavior
- Add grid emitter

## Version 0.8.0
- Add WIP node based behavior
- Support sub emission system
- Support mesh surface emitter

## Version 0.7.0
- Remove update(delta) function on individual particle system. 
Users do not need to manually call this function anymore. Add delta
parameter to BatchedParticleRenderer, which updates all registered
particle systems.
- Add a new behavior EmitSubParticleSystem, which emit a new particle emitter 
from a particle in the current system. 
- Fix MeshSurfaceEmitter's index bug.

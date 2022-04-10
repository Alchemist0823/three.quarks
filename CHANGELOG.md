# Change Log
## Version 0.7.0
- Remove update(delta) function on individual particle system. 
Users do not need to manually call this function anymore. Add delta
parameter to BatchedParticleRenderer, which updates all registered
particle systems.
- Add a new behavior EmitSubParticleSystem, which emit a new particle emitter 
from a particle in the current system. 
- Fix MeshSurfaceEmitter's index bug.

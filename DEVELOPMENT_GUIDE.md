# Welcome to Three.quarks development guide <!-- omit in toc -->

Go back to [README](./README.md)

### Code Structure

**ParticleEmitter** [./packages/three.quarks/src/ParticleEmitter.ts](./packages/three.quarks/src/ParticleEmitter.ts)

A particle emitter is a threejs `Object3D` that used as a reference point to emit particles.
It can be attached to any `Object3D` in the scene.

**ParticleSystem** [./packages/three.quarks/src/ParticleSystem.ts](./packages/three.quarks/src/ParticleSystem.ts)

The class represents each individual particle system instance. 
It simulates all the particle or trails in the system.

**BatchedRenderer** [./packages/three.quarks/src/BatchedRenderer.ts](./packages/three.quarks/src/BatchedRenderer.ts)

The class represents the batch renderer. a three.js scene should only have one batchedRenderer
It keeps references of all particle systems and rendering batch.
It batches all particle systems that has the same rendering pipeline to a single VFXBatch.

**QuarksLoader** [./packages/three.quarks/src/QuarksLoader.ts](./packages/three.quarks/src/QuarksLoader.ts)

QuarksLoader is a loader that loads quarks particle system from a json file. the json format is
compatible with three.js's json format.

**functions** [./packages/quarks.core/src/functions/](./packages/quarks.core/src/functions/)

A folder contains all the functions or value types that can be used as parameters of a particle system.

**shape** [./packages/quarks.core/src/shape/](./packages/quarks.core/src/shape/)

A folder contains all the predefined emitter shapes that can be used in a particle system.

**behaviors** [./packages/quarks.core/src/behaviors/](./packages/quarks.core/src/behaviors/)

A folder contains all the predefined behaviors that can be attached on a particle system.
An example would be SizeOverLife which means the size of the particle changes over its life time.


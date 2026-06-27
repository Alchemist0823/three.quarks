import {Object3D} from 'three';
import {BatchedRenderer} from './BatchedRenderer';
import {ParticleEmitter} from './ParticleEmitter';

/**
 * Convenience helpers for applying common particle-system operations to Object3D trees.
 */
export class QuarksUtil {
    /**
     * Runs a callback for every particle emitter in an object tree.
     * @param obj - Root object to traverse.
     * @param func - Callback invoked for each particle emitter.
     */
    static runOnAllParticleEmitters(obj: Object3D, func: (ps: ParticleEmitter) => void) {
        obj.traverse((child) => {
            if (child.type === 'ParticleEmitter') {
                func(child as ParticleEmitter);
            }
        });
    }

    /**
     * Adds every particle system in an object tree to a batched renderer.
     * @param obj - Root object to traverse.
     * @param batchRenderer - Renderer that receives each particle system.
     */
    static addToBatchRenderer(obj: Object3D, batchRenderer: BatchedRenderer) {
        QuarksUtil.runOnAllParticleEmitters(obj, (ps) => batchRenderer.addSystem(ps.system));
    }

    /**
     * Starts every particle system in an object tree.
     * @param obj - Root object to traverse.
     */
    static play(obj: Object3D) {
        QuarksUtil.runOnAllParticleEmitters(obj, (ps) => ps.system.play());
    }

    /**
     * Stops every particle system in an object tree and clears existing particles.
     * @param obj - Root object to traverse.
     */
    static stop(obj: Object3D) {
        QuarksUtil.runOnAllParticleEmitters(obj, (ps) => ps.system.stop());
    }

    /**
     * Sets auto-destroy on every particle system in an object tree.
     * @param obj - Root object to traverse.
     * @param value - Whether each particle system should destroy itself after finishing.
     */
    static setAutoDestroy(obj: Object3D, value: boolean) {
        QuarksUtil.runOnAllParticleEmitters(obj, (ps) => (ps.system.autoDestroy = value));
    }

    /**
     * Stops emission for every particle system in an object tree while keeping existing particles alive.
     * @param obj - Root object to traverse.
     */
    static endEmit(obj: Object3D) {
        QuarksUtil.runOnAllParticleEmitters(obj, (ps) => ps.system.endEmit());
    }

    /**
     * Restarts every particle system in an object tree.
     * @param obj - Root object to traverse.
     */
    static restart(obj: Object3D) {
        QuarksUtil.runOnAllParticleEmitters(obj, (ps) => ps.system.restart());
    }

    /**
     * Pauses every particle system in an object tree.
     * @param obj - Root object to traverse.
     */
    static pause(obj: Object3D) {
        QuarksUtil.runOnAllParticleEmitters(obj, (ps) => ps.system.pause());
    }
}

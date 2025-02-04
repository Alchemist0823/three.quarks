import {Object3D} from 'three';
import {ParticleEmitter} from './ParticleEmitter';
import {BatchedRenderer} from './BatchedRenderer';

export class QuarksUtil {
    /**
     * Run a function on all particle emitters in the object and the object's children.
     * @param obj
     * @param func
     */
    static runOnAllParticleEmitters(obj: Object3D, func: (ps: ParticleEmitter) => void) {
        obj.traverse((child) => {
            if (child.type === 'ParticleEmitter') {
                func(child as ParticleEmitter);
            }
        });
        if (obj.type === 'ParticleEmitter') {
            func(obj as ParticleEmitter);
        }
    }

    /**
     * Add all particle systems in the object and the object's children to the batch renderer.
     * @param obj
     * @param batchRenderer
     */
    static addToBatchRenderer(obj: Object3D, batchRenderer: BatchedRenderer) {
        QuarksUtil.runOnAllParticleEmitters(obj, (ps) => {
            batchRenderer.addSystem(ps.system);
        });
    }

    /**
     * Start playing all particle systems in the object and the object's children.
     * @param obj
     */
    static play(obj: Object3D) {
        QuarksUtil.runOnAllParticleEmitters(obj, (ps) => {
            ps.system.play();
        });
    }

    /**
     * Stop all particle systems in the object and the object's children.
     * this call will clear all existing particles.
     * @param obj
     */
    static stop(obj: Object3D) {
        QuarksUtil.runOnAllParticleEmitters(obj, (ps) => {
            ps.system.stop();
        });
    }

    static setAutoDestroy(obj: Object3D, value: boolean) {
        QuarksUtil.runOnAllParticleEmitters(obj, (ps) => {
            ps.system.autoDestroy = value;
        });
    }

    /**
     * Stop emit new particles from all particle systems and
     * keep simulating the existing particles in the object and the object's children.
     * @param obj
     */
    static endEmit(obj: Object3D) {
        QuarksUtil.runOnAllParticleEmitters(obj, (ps) => {
            ps.system.endEmit();
        });
    }

    /**
     * Restart all particle systems in the object and the object's children.
     * @param obj
     */
    static restart(obj: Object3D) {
        QuarksUtil.runOnAllParticleEmitters(obj, (ps) => {
            ps.system.restart();
        });
    }

    /**
     * Pause the simulation of all particle systems in the object and the object's children.
     * @param obj
     */
    static pause(obj: Object3D) {
        QuarksUtil.runOnAllParticleEmitters(obj, (ps) => {
            ps.system.pause();
        });
    }
}
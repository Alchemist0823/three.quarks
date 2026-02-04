import {Object3D, Object3DEventMap} from 'three';
import {IParticleSystem, IEmitter, SerializationOptions} from 'quarks.core';

/**
 * Interface representing metadata used in Threejs object toJSON method.
 */
export interface MetaData {
    geometries: {[key: string]: any};
    materials: {[key: string]: any};
    textures: {[key: string]: any};
    images: {[key: string]: any};
    shapes: {[key: string]: any};
    skeletons: {[key: string]: any};
    animations: {[key: string]: any};
    nodes: {[key: string]: any};
}

/**
 * Class representing a three.quarks particle emitter. particle emitter is a node in the three.js scene graph
 * every particle emitter only associates with a particle system.
 * particle system
 * @extends Object3D
 * @template E - Type of the event map.
 */
export class ParticleEmitter<E extends Object3DEventMap = Object3DEventMap>extends Object3D<E> implements IEmitter {
    type = 'ParticleEmitter';
    system: IParticleSystem;

    /**
     * Creates an instance of ParticleEmitter.
     * @param {IParticleSystem} system - The particle system to be used.
     */
    constructor(system: IParticleSystem) {
        super();
        this.system = system;
    }

    /**
     * Clones the particle emitter.
     * @returns {ParticleEmitter} A new instance of ParticleEmitter.
     */
    clone() {
        const system = this.system.clone();
        (system.emitter as unknown as ParticleEmitter).copy(this, true);
        return system.emitter as any;
    }

    /**
     * Disposes the particle emitter.
     */
    dispose() {}

    /**
     * Extracts data from the cache.
     * @param {any} cache - The cache to extract data from.
     * @returns {any[]} An array of extracted data without metadata.
     */
    extractFromCache(cache: any) {
        const values = [];
        for (const key in cache) {
            const data = cache[key];
            delete data.metadata;
            values.push(data);
        }
        return values;
    }

    /**
     * Converts the particle emitter to JSON.
     * @param {MetaData} [meta] - Optional metadata.
     * @param {SerializationOptions} [options={}] - Optional serialization options.
     * @returns {any} The JSON representation of the particle emitter.
     */
    toJSON(meta?: MetaData, options: SerializationOptions = {}): any {
        const children = this.children;
        this.children = this.children.filter((child) => child.type !== 'ParticleSystemPreview');
        const data = super.toJSON(meta);
        this.children = children;
        if (this.system !== null) (data.object as any).ps = this.system.toJSON(meta!, options);
        return data;
    }
}

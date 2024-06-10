import {Object3D, Object3DEventMap} from 'three';
import {IParticleSystem, SerializationOptions} from './BatchedRenderer';

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

export class ParticleEmitter<E extends Object3DEventMap = Object3DEventMap> extends Object3D<E> {
    type = 'ParticleEmitter';
    system: IParticleSystem;
    //interleavedBuffer: InterleavedBuffer;

    constructor(system: IParticleSystem) {
        super();
        this.system = system;
        // this.visible = false;
        // TODO: implement boundingVolume
    }

    clone() {
        const system = this.system.clone();
        system.emitter.copy(this, true);
        return system.emitter as any;
    }

    dispose() {}

    // extract data from the cache hash
    // remove metadata on each item
    // and return as array
    extractFromCache(cache: any) {
        const values = [];
        for (const key in cache) {
            const data = cache[key];
            delete data.metadata;
            values.push(data);
        }
        return values;
    }

    toJSON(meta?: MetaData, options: SerializationOptions = {}): any {
        const children = this.children;
        this.children = this.children.filter((child) => child.type !== 'ParticleSystemPreview');
        const data = super.toJSON(meta);
        this.children = children;
        if (this.system !== null) data.object.ps = this.system.toJSON(meta!, options);
        return data;
    }
}

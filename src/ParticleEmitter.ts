import {ParticleSystem, SerializationOptions} from './ParticleSystem';
import {Object3D, BaseEvent} from 'three';

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

export class ParticleEmitter<E extends BaseEvent> extends Object3D<E> {
    type = 'ParticleEmitter';
    system: ParticleSystem;
    //interleavedBuffer: InterleavedBuffer;

    constructor(system: ParticleSystem) {
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
        // meta is a string when called from JSON.stringify
        const isRootObject = meta === undefined || typeof meta === 'string';
        const output: any = {};
        // meta is a hash used to collect geometries, materials.
        // not providing it implies that this is the root object
        // being serialized.
        if (isRootObject) {
            // initialize meta obj
            meta = {
                geometries: {},
                materials: {},
                textures: {},
                images: {},
                shapes: {},
                skeletons: {},
                animations: {},
                nodes: {},
            };

            output.metadata = {
                version: 4.5,
                type: 'Object',
                generator: 'Object3D.toJSON',
            };
        }

        // standard Object3D serialization
        const object: any = {};

        object.uuid = this.uuid;
        object.type = this.type;

        if (this.name !== '') object.name = this.name;
        if (this.castShadow === true) object.castShadow = true;
        if (this.receiveShadow === true) object.receiveShadow = true;
        if (this.visible === false) object.visible = false;
        if (this.frustumCulled === false) object.frustumCulled = false;
        if (this.renderOrder !== 0) object.renderOrder = this.renderOrder;
        if (JSON.stringify(this.userData) !== '{}') object.userData = this.userData;

        object.layers = this.layers.mask;
        object.matrix = this.matrix.toArray();

        if (this.matrixAutoUpdate === false) object.matrixAutoUpdate = false;

        // object specific properties

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (this.system !== null) object.ps = this.system.toJSON(meta!, options);

        if (this.children.length > 0) {
            object.children = [];
            for (let i = 0; i < this.children.length; i++) {
                if (this.children[i].type !== 'ParticleSystemPreview') {
                    object.children.push(this.children[i].toJSON(meta).object);
                }
            }
        }

        if (isRootObject) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const geometries = this.extractFromCache(meta!.geometries);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const materials = this.extractFromCache(meta!.materials);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const textures = this.extractFromCache(meta!.textures);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const images = this.extractFromCache(meta!.images);

            if (geometries.length > 0) output.geometries = geometries;
            if (materials.length > 0) output.materials = materials;
            if (textures.length > 0) output.textures = textures;
            if (images.length > 0) output.images = images;
        }

        output.object = object;
        return output;
    }
}

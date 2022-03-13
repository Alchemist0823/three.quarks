
import {ParticleSystem} from './ParticleSystem';
import {
    Blending,
    Texture,
    Object3D,
    BufferGeometry
} from 'three';

import particle_frag from './shaders/particle_frag.glsl';
import particle_vert from './shaders/particle_vert.glsl';
import local_particle_vert from './shaders/local_particle_vert.glsl';
import stretched_bb_particle_vert from './shaders/stretched_bb_particle_vert.glsl';

export class ParticleEmitter extends Object3D {

    type: string = "ParticleEmitter";
    system: ParticleSystem;
    //interleavedBuffer: InterleavedBuffer;

    constructor(system: ParticleSystem) {
        super();
        this.system = system;
        // this.visible = false;
        // TODO: implement boundingVolume
    }

    clone() {
        let system = this.system.clone();
        system.emitter.copy(this, true);
        return system.emitter as any;
    }

    dispose() {
    }


    // extract data from the cache hash
    // remove metadata on each item
    // and return as array
    extractFromCache( cache: any ) {
        var values = [];
        for ( var key in cache ) {

            var data = cache[ key ];
            delete data.metadata;
            values.push( data );

        }
        return values;
    }

    toJSON(meta?: { geometries: any; materials: any; textures: any; images: any, shapes: any }): any {
		// meta is a string when called from JSON.stringify
		var isRootObject = ( meta === undefined || typeof meta === 'string' );
		var output: any = {};
		// meta is a hash used to collect geometries, materials.
		// not providing it implies that this is the root object
		// being serialized.
        if ( isRootObject ) {

            // initialize meta obj
            meta = {
                geometries: {},
                materials: {},
                textures: {},
                images: {},
                shapes: {}
            };

            output.metadata = {
                version: 4.5,
                type: 'Object',
                generator: 'Object3D.toJSON'
            };

        }

		// standard Object3D serialization
		var object: any = {};

        object.uuid = this.uuid;
        object.type = this.type;

        if ( this.name !== '' ) object.name = this.name;
        if ( this.castShadow === true ) object.castShadow = true;
        if ( this.receiveShadow === true ) object.receiveShadow = true;
        if ( this.visible === false ) object.visible = false;
        if ( this.frustumCulled === false ) object.frustumCulled = false;
        if ( this.renderOrder !== 0 ) object.renderOrder = this.renderOrder;
        if ( JSON.stringify( this.userData ) !== '{}' ) object.userData = this.userData;

		object.layers = this.layers.mask;
		object.matrix = this.matrix.toArray();

		if ( this.matrixAutoUpdate === false ) object.matrixAutoUpdate = false;

		// object specific properties

        if ( this.system !== null ) object.ps = this.system.toJSON(meta);

		if ( this.children.length > 0 ) {
			object.children = [];
			for ( var i = 0; i < this.children.length; i ++ ) {
				object.children.push( this.children[ i ].toJSON( meta ).object );
            }
		}

		if ( isRootObject ) {
			var geometries = this.extractFromCache( meta!.geometries );
			var materials = this.extractFromCache( meta!.materials );
			var textures = this.extractFromCache( meta!.textures );
			var images = this.extractFromCache( meta!.images );

			if ( geometries.length > 0 ) output.geometries = geometries;
			if ( materials.length > 0 ) output.materials = materials;
			if ( textures.length > 0 ) output.textures = textures;
			if ( images.length > 0 ) output.images = images;
		}

		output.object = object;
		return output;
    }
}

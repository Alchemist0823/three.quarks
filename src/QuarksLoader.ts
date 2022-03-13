import {
	Texture,
	Sprite,
	Group,
	Object3D,
	CubeTexture,
	LoadingManager,
	ImageLoader,
	FileLoader,
	LoaderUtils,
	DefaultLoadingManager,
	DataTexture,
	Source,
	LinearMipmapLinearFilter,
	LinearMipmapNearestFilter,
	NearestMipmapLinearFilter,
	NearestMipmapNearestFilter
} from "three";
import {ParticleSystem} from "./ParticleSystem";
import {
	UVMapping,
	CubeReflectionMapping,
	CubeRefractionMapping,
	EquirectangularReflectionMapping,
	EquirectangularRefractionMapping,
	CubeUVReflectionMapping,

	RepeatWrapping,
	ClampToEdgeWrapping,
	MirroredRepeatWrapping,

	NearestFilter,
	LinearFilter,
} from 'three';
import {BatchedParticleRenderer} from "./BatchedParticleRenderer";

const TYPED_ARRAYS: {[index: string]: any} = {
	Int8Array: Int8Array,
	Uint8Array: Uint8Array,
	Uint8ClampedArray: Uint8ClampedArray,
	Int16Array: Int16Array,
	Uint16Array: Uint16Array,
	Int32Array: Int32Array,
	Uint32Array: Uint32Array,
	Float32Array: Float32Array,
	Float64Array: Float64Array
};

function getTypedArray( type: string, buffer: any ) {
	return new TYPED_ARRAYS[ type ]( buffer );
}

export class QuarksLoader {
    manager: LoadingManager;
    crossOrigin: string = "anonymous";
    path?: string;
    resourcePath: string;

    constructor(manager?: LoadingManager) {
    	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;
    	this.resourcePath = '';
    }

    setPath ( value: string ) {
        this.path = value;
        return this;
    }

    setResourcePath ( value: string ) {
        this.resourcePath = value;
        return this;
    }

    setCrossOrigin ( value: string ) {
        this.crossOrigin = value;
        return this;
    }

	load ( url:string, renderer: BatchedParticleRenderer, onLoad:(object3d: Object3D)=>void, onProgress:()=>void, onError:(error:any)=>void ) {
		var scope = this;

		var path = ( this.path === undefined ) ? LoaderUtils.extractUrlBase( url ) : this.path;
		this.resourcePath = this.resourcePath || path;

		var loader = new FileLoader( scope.manager );
        if (this.path)
		      loader.setPath( this.path );
		loader.load( url, function ( text ) {

			var json = null;

			try {
				json = JSON.parse( text as string );
			} catch ( error: any ) {
				if ( onError !== undefined ) onError( error );
				console.error( 'THREE:ObjectLoader: Can\'t parse ' + url + '.', error.message );
				return;
			}

			var metadata = json.metadata;

			if ( metadata === undefined || metadata.type === undefined || metadata.type.toLowerCase() === 'geometry' ) {
				console.error( 'THREE.ObjectLoader: Can\'t load ' + url );
				return;
			}

			scope.parse( json, onLoad, renderer );
		}, onProgress, onError );
	}

    loadImage(loader :ImageLoader, url:string ) {
        const scope = this;
        scope.manager.itemStart( url );

        return loader.load( url, function () {
            scope.manager.itemEnd( url );
        }, undefined, function () {
            scope.manager.itemError( url );
            scope.manager.itemEnd( url );
        } );

    }

	deserializeImage(loader :ImageLoader, image: any ) {
		if ( typeof image === 'string' ) {
			const url = image;
			const path = /^(\/\/)|([a-z]+:(\/\/)?)/i.test( url ) ? url : this.resourcePath + url;
			return this.loadImage( loader, path );
		} else {
			if ( image.data ) {
				return {
					data: getTypedArray( image.type, image.data ),
					width: image.width,
					height: image.height
				};
			} else {
				return null;
			}
		}
	}

	parseImages( json: any, onLoad: () => void ) {
		const scope = this;
		const images: any = {};
		let loader;
		if ( json !== undefined && json.length > 0 ) {
			const manager = new LoadingManager( onLoad );
			loader = new ImageLoader( manager );
			loader.setCrossOrigin( this.crossOrigin );
			for ( let i = 0, il = json.length; i < il; i ++ ) {
				const image = json[ i ];
				const url = image.url;
				if ( Array.isArray( url ) ) {
					// load array of images e.g CubeTexture
					const imageArray = [];
					for ( let j = 0, jl = url.length; j < jl; j ++ ) {
						const currentUrl = url[ j ];
						const deserializedImage = scope.deserializeImage(loader, currentUrl);
						if ( deserializedImage !== null ) {
							if ( deserializedImage instanceof HTMLImageElement ) {
								imageArray.push( deserializedImage );
							} else {
								// special case: handle array of data textures for cube textures
								imageArray.push( new DataTexture( deserializedImage.data, deserializedImage.width, deserializedImage.height ) );
							}
						}
					}
					images[ image.uuid ] = new Source( imageArray );
				} else {
					// load single image
					const deserializedImage = scope.deserializeImage(loader, image.url);
					images[ image.uuid ] = new Source( deserializedImage );
				}
			}
		}
		return images;
	}

	parseTextures( json: any, images : any) {

		function parseConstant( value: any, type : any) {

			if ( typeof value === 'number' ) return value;

			console.warn( 'THREE.ObjectLoader.parseTexture: Constant should be in numeric form.', value );

			return type[ value ];

		}

		const textures: any = {};

		if ( json !== undefined ) {

			for ( let i = 0, l = json.length; i < l; i ++ ) {

				const data = json[ i ];

				if ( data.image === undefined ) {

					console.warn( 'THREE.ObjectLoader: No "image" specified for', data.uuid );

				}

				if ( images[ data.image ] === undefined ) {

					console.warn( 'THREE.ObjectLoader: Undefined image', data.image );

				}

				const source = images[ data.image ];
				const image = source.data;

				let texture;

				if ( Array.isArray( image ) ) {

					texture = new CubeTexture();

					if ( image.length === 6 ) texture.needsUpdate = true;

				} else {

					if ( image && image.data ) {

						texture = new DataTexture();

					} else {

						texture = new Texture();

					}

					if ( image ) texture.needsUpdate = true; // textures can have undefined image data

				}

				texture.source = source;

				texture.uuid = data.uuid;

				if ( data.name !== undefined ) texture.name = data.name;

				if ( data.mapping !== undefined ) texture.mapping = parseConstant( data.mapping, TEXTURE_MAPPING );

				if ( data.offset !== undefined ) texture.offset.fromArray( data.offset );
				if ( data.repeat !== undefined ) texture.repeat.fromArray( data.repeat );
				if ( data.center !== undefined ) texture.center.fromArray( data.center );
				if ( data.rotation !== undefined ) texture.rotation = data.rotation;

				if ( data.wrap !== undefined ) {

					texture.wrapS = parseConstant( data.wrap[ 0 ], TEXTURE_WRAPPING );
					texture.wrapT = parseConstant( data.wrap[ 1 ], TEXTURE_WRAPPING );

				}

				if ( data.format !== undefined ) texture.format = data.format;
				if ( data.type !== undefined ) texture.type = data.type;
				if ( data.encoding !== undefined ) texture.encoding = data.encoding;

				if ( data.minFilter !== undefined ) texture.minFilter = parseConstant( data.minFilter, TEXTURE_FILTER );
				if ( data.magFilter !== undefined ) texture.magFilter = parseConstant( data.magFilter, TEXTURE_FILTER );
				if ( data.anisotropy !== undefined ) texture.anisotropy = data.anisotropy;

				if ( data.flipY !== undefined ) texture.flipY = data.flipY;

				if ( data.premultiplyAlpha !== undefined ) texture.premultiplyAlpha = data.premultiplyAlpha;
				if ( data.unpackAlignment !== undefined ) texture.unpackAlignment = data.unpackAlignment;

				if ( data.userData !== undefined ) texture.userData = data.userData;

				textures[ data.uuid ] = texture;

			}

		}

		return textures;

	}

	parseObject(data: any, textures: {[uuid:string]:Texture}, renderer: BatchedParticleRenderer) {
		let object;
		switch ( data.type ) {
			case 'ParticleEmitter':
				object = ParticleSystem.fromJSON(data.ps, textures, renderer).emitter;
				break;
			case 'Group':
				object = new Group();
				break;
			default:
				object = new Object3D();
		}

		object.uuid = data.uuid;

		if ( data.name !== undefined ) object.name = data.name;
		if ( data.matrix !== undefined ) {
			object.matrix.fromArray( data.matrix );

			if ( data.matrixAutoUpdate !== undefined ) object.matrixAutoUpdate = data.matrixAutoUpdate;
			if ( object.matrixAutoUpdate ) object.matrix.decompose( object.position, object.quaternion, object.scale );
		} else {
			if ( data.position !== undefined ) object.position.fromArray( data.position );
			if ( data.rotation !== undefined ) object.rotation.fromArray( data.rotation );
			if ( data.quaternion !== undefined ) object.quaternion.fromArray( data.quaternion );
			if ( data.scale !== undefined ) object.scale.fromArray( data.scale );
		}

		if ( data.castShadow !== undefined ) object.castShadow = data.castShadow;
		if ( data.receiveShadow !== undefined ) object.receiveShadow = data.receiveShadow;

		if ( data.visible !== undefined ) object.visible = data.visible;
		if ( data.frustumCulled !== undefined ) object.frustumCulled = data.frustumCulled;
		if ( data.renderOrder !== undefined ) object.renderOrder = data.renderOrder;
		if ( data.userData !== undefined ) object.userData = data.userData;
		if ( data.layers !== undefined ) object.layers.mask = data.layers;

		if ( data.children !== undefined ) {
			var children = data.children;
			for ( var i = 0; i < children.length; i ++ ) {
				object.add( this.parseObject( children[ i ], textures, renderer ) );
			}
		}
		return object;
	}

	parse ( json: any, onLoad: (object: any) => void, renderer: BatchedParticleRenderer) {
		var images = this.parseImages( json.images,  () => {
			if ( onLoad !== undefined ) onLoad( object );
		} );
		var textures = this.parseTextures( json.textures, images );
		var object = this.parseObject( json.object, textures, renderer);

		if ( json.images === undefined || json.images.length === 0 ) {
			if ( onLoad !== undefined ) onLoad( object );
		}
		return object;
	}
}

const TEXTURE_MAPPING = {
	UVMapping: UVMapping,
	CubeReflectionMapping: CubeReflectionMapping,
	CubeRefractionMapping: CubeRefractionMapping,
	EquirectangularReflectionMapping: EquirectangularReflectionMapping,
	EquirectangularRefractionMapping: EquirectangularRefractionMapping,
	CubeUVReflectionMapping: CubeUVReflectionMapping
};

const TEXTURE_WRAPPING = {
	RepeatWrapping: RepeatWrapping,
	ClampToEdgeWrapping: ClampToEdgeWrapping,
	MirroredRepeatWrapping: MirroredRepeatWrapping
};

const TEXTURE_FILTER = {
	NearestFilter: NearestFilter,
	NearestMipmapNearestFilter: NearestMipmapNearestFilter,
	NearestMipmapLinearFilter: NearestMipmapLinearFilter,
	LinearFilter: LinearFilter,
	LinearMipmapNearestFilter: LinearMipmapNearestFilter,
	LinearMipmapLinearFilter: LinearMipmapLinearFilter
};

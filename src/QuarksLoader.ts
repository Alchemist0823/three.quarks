import {Texture, Sprite, Group, Object3D, CubeTexture, LoadingManager, ImageLoader, FileLoader, LoaderUtils, DefaultLoadingManager} from "three";
import {ParticleSystem} from "./ParticleSystem";
import {
	UVMapping,
	CubeReflectionMapping,
	CubeRefractionMapping,
	EquirectangularReflectionMapping,
	EquirectangularRefractionMapping,
	SphericalReflectionMapping,
	CubeUVReflectionMapping,
	CubeUVRefractionMapping,

	RepeatWrapping,
	ClampToEdgeWrapping,
	MirroredRepeatWrapping,

	NearestFilter,
	NearestMipMapNearestFilter,
	NearestMipMapLinearFilter,
	LinearFilter,
	LinearMipMapNearestFilter,
	LinearMipMapLinearFilter
} from 'three';

const TEXTURE_MAPPING = {
	UVMapping: UVMapping,
	CubeReflectionMapping: CubeReflectionMapping,
	CubeRefractionMapping: CubeRefractionMapping,
	EquirectangularReflectionMapping: EquirectangularReflectionMapping,
	EquirectangularRefractionMapping: EquirectangularRefractionMapping,
	SphericalReflectionMapping: SphericalReflectionMapping,
	CubeUVReflectionMapping: CubeUVReflectionMapping,
	CubeUVRefractionMapping: CubeUVRefractionMapping
};

const TEXTURE_WRAPPING = {
	RepeatWrapping: RepeatWrapping,
	ClampToEdgeWrapping: ClampToEdgeWrapping,
	MirroredRepeatWrapping: MirroredRepeatWrapping
};

const TEXTURE_FILTER = {
	NearestFilter: NearestFilter,
	NearestMipmapNearestFilter: NearestMipMapNearestFilter,
	NearestMipmapLinearFilter: NearestMipMapLinearFilter,
	LinearFilter: LinearFilter,
	LinearMipmapNearestFilter: LinearMipMapNearestFilter,
	LinearMipmapLinearFilter: LinearMipMapLinearFilter
};


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

	load ( url:string, onLoad:()=>void, onProgress:()=>void, onError:(error:any)=>void ) {
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
			} catch ( error ) {
				if ( onError !== undefined ) onError( error );
				console.error( 'THREE:ObjectLoader: Can\'t parse ' + url + '.', error.message );
				return;
			}

			var metadata = json.metadata;

			if ( metadata === undefined || metadata.type === undefined || metadata.type.toLowerCase() === 'geometry' ) {
				console.error( 'THREE.ObjectLoader: Can\'t load ' + url );
				return;
			}

			scope.parse( json, onLoad );
		}, onProgress, onError );
	}

    loadImage(loader:ImageLoader, url:string ) {
        const scope = this;
        scope.manager.itemStart( url );

        return loader.load( url, function () {
            scope.manager.itemEnd( url );
        }, undefined, function () {
            scope.manager.itemError( url );
            scope.manager.itemEnd( url );
        } );

    }

	parseImages ( json: any, onLoad: ()=>void ) {

		var scope = this;
		var images :any= {};

		if ( json !== undefined && json.length > 0 ) {

			var manager = new LoadingManager( onLoad );

			var loader = new ImageLoader( manager );
			loader.setCrossOrigin( this.crossOrigin );

			for ( var i = 0, il = json.length; i < il; i ++ ) {
				var image = json[ i ];
				var url = image.url;

				if ( Array.isArray( url ) ) {
					// load array of images e.g CubeTexture

					images[ image.uuid ] = [];
					for ( var j = 0, jl = url.length; j < jl; j ++ ) {
						var currentUrl = url[ j ];
						var path = /^(\/\/)|([a-z]+:(\/\/)?)/i.test( currentUrl ) ? currentUrl : scope.resourcePath + currentUrl;
						images[ image.uuid ].push( this.loadImage( loader, path ) );
					}
				} else {
					// load single image
					var path = /^(\/\/)|([a-z]+:(\/\/)?)/i.test( image.url ) ? image.url : scope.resourcePath + image.url;
					images[ image.uuid ] = this.loadImage( loader, path );
				}
			}
		}
		return images;
	}

	parseTextures ( json: any, images: {[uuid:string]: any} ) {

		function parseConstant( value: any, type: any ) {
			if ( typeof value === 'number' ) return value;
			console.warn( 'THREE.ObjectLoader.parseTexture: Constant should be in numeric form.', value );
			return type[ value ];
		}

		var textures: {[uuid:string]: Texture} = {};
		if ( json !== undefined ) {
			for ( var i = 0, l = json.length; i < l; i ++ ) {
				var data = json[ i ];
				if ( data.image === undefined ) {
					console.warn( 'THREE.ObjectLoader: No "image" specified for', data.uuid );
				}
				if ( images[ data.image ] === undefined ) {
					console.warn( 'THREE.ObjectLoader: Undefined image', data.image );
				}

				var texture;
				if ( Array.isArray( images[ data.image ] ) ) {
					texture = new CubeTexture( images[ data.image ] );
				} else {
					texture = new Texture( images[ data.image ] );
				}
				texture.needsUpdate = true;
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

				textures[ data.uuid ] = texture;
			}

		}

		return textures;

	}

	parseObject(data: any, textures: {[uuid:string]:Texture}) {
		var object;
		switch ( data.type ) {
			case 'ParticleEmitter':
				object = ParticleSystem.fromJSON(data.ps, textures).emitter;
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
				object.add( this.parseObject( children[ i ], textures ) );
			}
		}
		return object;
	}

	parse ( json: any, onLoad: (object: any) => void ) {
		var images = this.parseImages( json.images, function () {
			if ( onLoad !== undefined ) onLoad( object );
		} );
		var textures = this.parseTextures( json.textures, images );
		var object = this.parseObject( json.object, textures );

		if ( json.images === undefined || json.images.length === 0 ) {
			if ( onLoad !== undefined ) onLoad( object );
		}
		return object;
	}
}

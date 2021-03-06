import {Behavior} from './behaviors/Behavior';
import {Particle} from './Particle';
import {ParticleSystem} from './ParticleSystem';
import {
    AdditiveBlending,
    Blending,
    BufferAttribute,
    InstancedBufferAttribute,
    InstancedBufferGeometry,
    InterleavedBuffer,
    InterleavedBufferAttribute,
    Matrix3,
    Mesh,
    ShaderMaterial,
    Texture,
    Uniform,
    Vector2,
    Vector4,
    Object3D,
    TrianglesDrawMode,
    DynamicDrawUsage, DoubleSide, FrontSide
} from 'three';

import particle_frag from './shaders/particle_frag.glsl';
import particle_vert from './shaders/particle_vert.glsl';
import local_particle_vert from './shaders/local_particle_vert.glsl';
import stretched_bb_particle_vert from './shaders/stretched_bb_particle_vert.glsl';

export interface ParticleRendererParameters {
    // 5 component x,y,z,u,v
    instancingGeometry?: ArrayLike<number>;
    texture?: Texture;
    uTileCount?: number;
    vTileCount?: number;
    worldSpace?: boolean;
    blending?: Blending;
    renderMode? : RenderMode;
    speedFactor? : number;
}

export enum RenderMode {
    BillBoard = 0,
    StretchedBillBoard = 1,
    LocalSpaceBillBoard = 2,
}

export class ParticleEmitter extends Mesh {

    type: string = "ParticleEmitter";
    system: ParticleSystem;
    geometry: InstancedBufferGeometry;
    material: ShaderMaterial;
    interleavedBuffer: InterleavedBuffer;

    private rotationBuffer: InstancedBufferAttribute;
    private sizeBuffer: InstancedBufferAttribute;
    private colorBuffer: InstancedBufferAttribute;
    private offsetBuffer: InstancedBufferAttribute;
    private velocityBuffer? : InstancedBufferAttribute;

    private tiling: boolean;
    private uvTileBuffer?: InstancedBufferAttribute;
    public renderMode: RenderMode;
    private speedFactor: number;
    private worldSpace: boolean;

    constructor(system: ParticleSystem, parameters: ParticleRendererParameters) {
        super();
        this.system = system;
        this.geometry = new InstancedBufferGeometry();
        this.renderMode = parameters.renderMode || RenderMode.BillBoard;
        this.speedFactor = parameters.speedFactor || 1;
        this.worldSpace = (parameters.worldSpace !== undefined) ? parameters.worldSpace : false;

        const instancingGeometry = new Float32Array(parameters.instancingGeometry || [
            -0.5, -0.5, 0, 0, 0,
            0.5, -0.5, 0, 1, 0,
            0.5, 0.5, 0, 1, 1,
            -0.5, 0.5, 0, 0, 1
        ]);

        let uniforms: {[a:string]:Uniform} = {};
        let defines: {[b:string]:string} = {};

        this.interleavedBuffer = new InterleavedBuffer(instancingGeometry, 5);

        this.geometry.setIndex([0, 1, 2, 0, 2, 3]);
        this.geometry.setAttribute('position', new InterleavedBufferAttribute(this.interleavedBuffer, 3, 0, false));
        this.geometry.setAttribute('uv', new InterleavedBufferAttribute(this.interleavedBuffer, 2, 3, false));

        this.offsetBuffer = new InstancedBufferAttribute(new Float32Array(system.maxParticle * 3), 3);
        this.offsetBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setAttribute('offset', this.offsetBuffer);
        this.colorBuffer = new InstancedBufferAttribute(new Float32Array(system.maxParticle * 4), 4);
        this.offsetBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setAttribute('color', this.colorBuffer);
        this.rotationBuffer = new InstancedBufferAttribute(new Float32Array(system.maxParticle), 1);
        this.offsetBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setAttribute('rotation', this.rotationBuffer);
        this.sizeBuffer = new InstancedBufferAttribute(new Float32Array(system.maxParticle), 1);
        this.offsetBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setAttribute('size', this.sizeBuffer);


        this.tiling = true;
        if (parameters.texture) {
            defines['USE_MAP'] = '';
            defines['USE_UV'] = '';
            uniforms['map'] = new Uniform(parameters.texture);
            //@ts-ignore
            uniforms['uvTransform'] = new Uniform(new Matrix3().copy(parameters.texture.matrix));

            let uTileCount = parameters.uTileCount || 1;
            let vTileCount = parameters.vTileCount || 1;
            //this.tiling = uTileCount > 1 || vTileCount > 1;
            this.system.tileCount = uTileCount * vTileCount;
            if (this.tiling) {
                this.uvTileBuffer = new InstancedBufferAttribute(new Float32Array(system.maxParticle), 1);
                this.uvTileBuffer.setUsage(DynamicDrawUsage);
                this.geometry.setAttribute('uvTile', this.uvTileBuffer);
                defines['UV_TILE']='';
                uniforms['tileCount'] = new Uniform(new Vector2(uTileCount, vTileCount));
            }
        }

        if (parameters.worldSpace !== undefined? parameters.worldSpace: true) {
            defines['WORLD_SPACE']='';
        }

        if (this.renderMode === RenderMode.BillBoard || this.renderMode === RenderMode.LocalSpaceBillBoard) {
            let vertexShader;
            let side;
            if (this.renderMode === RenderMode.LocalSpaceBillBoard) {
                vertexShader = local_particle_vert;
                side = DoubleSide;
            } else {
                vertexShader = particle_vert;
                side = FrontSide;
            }
            this.material = new ShaderMaterial({
                uniforms: uniforms,
                defines: defines,
                vertexShader: vertexShader,
                fragmentShader: particle_frag,
                transparent: true,
                depthWrite: false,
                blending: parameters.blending || AdditiveBlending,
                side: side,
            });
        } else if (this.renderMode === RenderMode.StretchedBillBoard) {

            this.velocityBuffer = new InstancedBufferAttribute(new Float32Array(system.maxParticle * 3), 3);
            this.velocityBuffer.setUsage(DynamicDrawUsage);
            this.geometry.setAttribute('velocity', this.velocityBuffer);

            uniforms['speedFactor'] = new Uniform(parameters.speedFactor);
            this.material = new ShaderMaterial({
                uniforms: uniforms,
                defines: defines,
                vertexShader: stretched_bb_particle_vert,
                fragmentShader: particle_frag,
                transparent: true,
                depthWrite: false,
                blending: parameters.blending || AdditiveBlending,
            });
        } else {
            throw new Error("render mode unavailable");
        }

        // TODO: implement boundingVolume
        this.frustumCulled = false;
    }

    clone() {
        let system = this.system.clone();
        return system.emitter as any;
    }

    update() {
        const particles = this.system.particles;
        let particleNum = this.system.particleNum;

        this.geometry.instanceCount = particleNum;
        for (let i = 0; i < particleNum; i ++) {
            let particle = particles[i];
            this.offsetBuffer.setXYZ(i, particle.position.x, particle.position.y, particle.position.z);
            this.colorBuffer.setXYZW(i, particle.color.x, particle.color.y, particle.color.z, particle.color.w);
            this.rotationBuffer.setX(i, particle.rotation);
            this.sizeBuffer.setX(i, particle.size);
            if (this.renderMode === RenderMode.StretchedBillBoard) {
                this.velocityBuffer!.setXYZ(i, particle.velocity.x, particle.velocity.y, particle.velocity.z);
            }
            if (this.tiling) {
                this.uvTileBuffer!.setX(i, particle.uvTile);
            }
        }

        if (particleNum > 0) {
            this.offsetBuffer.updateRange.count = particleNum * 3;
            this.offsetBuffer.needsUpdate = true;

            this.colorBuffer.updateRange.count = particleNum * 4;
            this.colorBuffer.needsUpdate = true;

            this.rotationBuffer.updateRange.count = particleNum;
            this.rotationBuffer.needsUpdate = true;

            this.sizeBuffer.updateRange.count = particleNum;
            this.sizeBuffer.needsUpdate = true;

            if (this.renderMode === RenderMode.StretchedBillBoard) {
                this.velocityBuffer!.updateRange.count = particleNum * 3;
                this.velocityBuffer!.needsUpdate = true;
            }

            if (this.tiling) {
                this.uvTileBuffer!.updateRange.count = particleNum;
                this.uvTileBuffer!.needsUpdate = true;
            }
        }
    }

    dispose() {
        this.geometry.dispose();
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

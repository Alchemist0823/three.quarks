
import {Particle, RecordState, TrailParticle} from './Particle';
import {
    AdditiveBlending,
    Blending,
    InstancedBufferAttribute,
    InstancedBufferGeometry,
    Matrix3,
    Mesh,
    ShaderMaterial,
    Texture,
    Uniform,
    Vector2,
    DynamicDrawUsage,
    DoubleSide,
    FrontSide,
    BufferGeometry,
    PlaneBufferGeometry,
    NormalBlending,
    Vector3,
    Quaternion,
    Sprite,
    BufferAttribute,
    BoxBufferGeometry, Vector4
} from 'three';

import trail_frag from './shaders/trail_frag.glsl';
import trail_vert from './shaders/trail_vert.glsl';
import {ParticleSystemBatch} from "./ParticleSystemBatch";

export interface ParticleSystemBatchSettings {
    // 5 component x,y,z,u,v
    instancingGeometry: BufferGeometry;
    texture: Texture;
    uTileCount: number;
    vTileCount: number;
    blending: Blending;
    renderMode : RenderMode;
    renderOrder : number;
    transparent: boolean;
}

export enum RenderMode {
    BillBoard = 0,
    StretchedBillBoard = 1,
    LocalSpace = 2,
    Trail = 3,
}

const DEFAULT_MAX_PARTICLE = 10000;
const UP = new Vector3(0, 0, 1);

export class TrailBatch extends ParticleSystemBatch {
    geometry!: BufferGeometry;

    private positionBuffer!: BufferAttribute;
    private previousBuffer!: BufferAttribute;
    private nextBuffer!: BufferAttribute;
    private uvBuffer!: BufferAttribute;
    private sideBuffer!: BufferAttribute;
    private widthBuffer!: BufferAttribute;
    private colorBuffer!: BufferAttribute;
    private indexBuffer!: BufferAttribute;

    constructor(settings: ParticleSystemBatchSettings) {
        super(settings);

        this.setupBuffers();
        this.rebuildMaterial();
        // TODO: implement boundingVolume
    }

    setupBuffers(): void {
        this.geometry = new BufferGeometry();
        this.indexBuffer = new BufferAttribute(new Uint32Array(DEFAULT_MAX_PARTICLE * 6), 1);
        this.indexBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setIndex(this.indexBuffer);

        this.positionBuffer = new BufferAttribute(new Float32Array(DEFAULT_MAX_PARTICLE * 6), 3);
        this.positionBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setAttribute('position', this.positionBuffer);
        this.previousBuffer = new BufferAttribute(new Float32Array(DEFAULT_MAX_PARTICLE * 6), 3);
        this.previousBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setAttribute('previous', this.previousBuffer);
        this.nextBuffer = new BufferAttribute(new Float32Array(DEFAULT_MAX_PARTICLE * 6), 3);
        this.nextBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setAttribute('next', this.nextBuffer);
        this.widthBuffer = new BufferAttribute(new Float32Array(DEFAULT_MAX_PARTICLE * 2), 1);
        this.widthBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setAttribute('width', this.widthBuffer);
        this.sideBuffer = new BufferAttribute(new Float32Array(DEFAULT_MAX_PARTICLE * 2), 1);
        this.sideBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setAttribute('side', this.sideBuffer);
        this.uvBuffer = new BufferAttribute(new Float32Array(DEFAULT_MAX_PARTICLE * 4), 2);
        this.uvBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setAttribute('uv', this.uvBuffer);
        this.colorBuffer = new BufferAttribute(new Float32Array(DEFAULT_MAX_PARTICLE * 8), 4);
        this.colorBuffer.setUsage(DynamicDrawUsage);
        this.geometry.setAttribute('color', this.colorBuffer);
    }

    rebuildMaterial() {
        let uniforms: { [a: string]: { value: any } } = {
            lineWidth: { value: 1 },
            map: { value: null },
            useMap: { value: 0 },
            alphaMap: { value: null },
            useAlphaMap: { value: 0 },
            resolution: { value: new Vector2(1, 1) },
            sizeAttenuation: { value: 1 },
            visibility: { value: 1 },
            alphaTest: { value: 0 },
            repeat: { value: new Vector2(1, 1) },
        };
        let defines: { [b: string]: string } = {};

        defines['USE_MAP'] = '';
        defines['USE_UV'] = '';
        uniforms['map'] = new Uniform(this.settings.texture);
        //@ts-ignore
        uniforms['uvTransform'] = new Uniform(new Matrix3().copy(this.settings.texture.matrix));
        let uTileCount = this.settings.uTileCount;
        let vTileCount = this.settings.vTileCount;

        defines['UV_TILE'] = '';
        uniforms['tileCount'] = new Uniform(new Vector2(uTileCount, vTileCount));

        if (this.settings.renderMode === RenderMode.Trail) {
            this.material = new ShaderMaterial({
                uniforms: uniforms,
                defines: defines,
                vertexShader: trail_vert,
                fragmentShader: trail_frag,
                transparent: this.settings.transparent,
                depthWrite: !this.settings.transparent,
                side: DoubleSide,
                blending: this.settings.blending || AdditiveBlending,
            });
        } else {
            throw new Error("render mode unavailable");
        }
    }

    /*
    clone() {
        let system = this.system.clone();
        return system.emitter as any;
    }*/

    update2() {
        /*this.colorBuffer.setXYZW(0, 1, 1, 1, 1);
        this.colorBuffer.setXYZW(1, 1, 1, 1, 1);
        this.colorBuffer.setXYZW(2, 1, 1, 1, 1);
        this.colorBuffer.setXYZW(3, 1, 1, 1, 1);

        this.colorBuffer.updateRange.count = 4;
        this.colorBuffer.needsUpdate = true;*/

        this.positionBuffer.setXYZ(0, 0, 0, 0);
        this.positionBuffer.setXYZ(1, 1, 0, 0);
        this.positionBuffer.setXYZ(2, 0, 1, 0);
        this.positionBuffer.setXYZ(3, 1, 1, 0);
        this.positionBuffer.setXYZ(4, 0, 2, 0);
        this.positionBuffer.setXYZ(5, 1, 2, 0);

        this.positionBuffer.updateRange.count = 6;
        this.positionBuffer.needsUpdate = true;

        this.previousBuffer.setXYZ(0, 0, 0, 0);
        this.previousBuffer.setXYZ(1, 1, 0, 0);
        this.previousBuffer.setXYZ(2, 0, 0, 0);
        this.previousBuffer.setXYZ(3, 1, 0, 0);
        this.previousBuffer.setXYZ(4, 0, 1, 0);
        this.previousBuffer.setXYZ(5, 1, 1, 0);

        this.previousBuffer.updateRange.count = 6;
        this.previousBuffer.needsUpdate = true;

        this.nextBuffer.setXYZ(0, 0, 1, 0);
        this.nextBuffer.setXYZ(1, 1, 1, 0);
        this.nextBuffer.setXYZ(2, 0, 2, 0);
        this.nextBuffer.setXYZ(3, 1, 2, 0);
        this.nextBuffer.setXYZ(4, 0, 2, 0);
        this.nextBuffer.setXYZ(5, 1, 2, 0);

        this.nextBuffer.updateRange.count = 6;
        this.nextBuffer.needsUpdate = true;

        this.sideBuffer.setX(0, -1);
        this.sideBuffer.setX(1, 1);
        this.sideBuffer.setX(2, -1);
        this.sideBuffer.setX(3, 1);
        this.sideBuffer.setX(4, -1);
        this.sideBuffer.setX(5, 1);

        this.sideBuffer.updateRange.count = 6;
        this.sideBuffer.needsUpdate = true;

        this.widthBuffer.setX(0, 1);
        this.widthBuffer.setX(1, 1);
        this.widthBuffer.setX(2, 1);
        this.widthBuffer.setX(3, 1);
        this.widthBuffer.setX(4, 1);
        this.widthBuffer.setX(5, 1);

        this.widthBuffer.updateRange.count = 6;
        this.widthBuffer.needsUpdate = true;

        this.indexBuffer.setX(0, 0);
        this.indexBuffer.setX(1, 1);
        this.indexBuffer.setX(2, 2);
        this.indexBuffer.setX(3, 2);
        this.indexBuffer.setX(4, 1);
        this.indexBuffer.setX(5, 3);
        this.indexBuffer.setX(6, 2);
        this.indexBuffer.setX(7, 3);
        this.indexBuffer.setX(8, 4);
        this.indexBuffer.setX(9, 4);
        this.indexBuffer.setX(10, 3);
        this.indexBuffer.setX(11, 5);

        this.indexBuffer.updateRange.count = 12;
        this.indexBuffer.needsUpdate = true;

        this.geometry.setDrawRange(0, 12);
    }

    update() {
        let index = 0;
        let triangles = 0;

        this.systems.forEach(system => {
            const particles = system.particles;
            let particleNum = system.particleNum;


            for (let j = 0; j < particleNum; j++) {
                let particle = particles[j] as TrailParticle;
                //TODO: remove
                /*particle.previous = [
                    new RecordState(new Vector3(0, 0, 0), 0.1, new Vector4(1,1,1,1)),
                    new RecordState(new Vector3(1, 1, 0), 0.1, new Vector4(1,1,1,1)),
                    new RecordState(new Vector3(2, 2, 1), 0.1, new Vector4(1,1,1,1)),
                    new RecordState(new Vector3(3, 3, 1), 0.1, new Vector4(1,1,1,1)),
                    new RecordState(new Vector3(4, 4, 2), 0.1, new Vector4(1,1,1,1)),
                ];*/

                for (let i = 0; i < particle.previous.length; i++, index += 2) {
                    const recordState = particle.previous[i];
                    this.positionBuffer.setXYZ(index, recordState.position.x, recordState.position.y, recordState.position.z);
                    this.positionBuffer.setXYZ(index + 1, recordState.position.x, recordState.position.y, recordState.position.z);

                    let previous;
                    if (i - 1 >= 0) {
                        previous = particle.previous[i - 1];
                    } else {
                        previous = particle.previous[0];
                    }
                    this.previousBuffer.setXYZ(index, previous.position.x, previous.position.y, previous.position.z);
                    this.previousBuffer.setXYZ(index + 1, previous.position.x, previous.position.y, previous.position.z);

                    let next;
                    if (i + 1 < particle.previous.length) {
                        next = particle.previous[i + 1];
                    } else {
                        next = particle.previous[particle.previous.length - 1];
                    }
                    this.nextBuffer.setXYZ(index, next.position.x, next.position.y, next.position.z);
                    this.nextBuffer.setXYZ(index + 1, next.position.x, next.position.y, next.position.z);

                    this.sideBuffer.setX(index, -1);
                    this.sideBuffer.setX(index + 1, 1);

                    this.widthBuffer.setX(index, recordState.size);
                    this.widthBuffer.setX(index + 1, recordState.size);

                    this.uvBuffer.setXY(index,  i / particle.previous.length, 0);
                    this.uvBuffer.setXY(index + 1, i / particle.previous.length, 1);

                    this.colorBuffer.setXYZW(index, recordState.color.x, recordState.color.y, recordState.color.z, recordState.color.w);
                    this.colorBuffer.setXYZW(index + 1, recordState.color.x, recordState.color.y, recordState.color.z, recordState.color.w);

                    if (i + 1 < particle.previous.length) {
                        this.indexBuffer.setX(triangles * 3, index);
                        this.indexBuffer.setX(triangles * 3 + 1, index + 1);
                        this.indexBuffer.setX(triangles * 3 + 2, index + 2);
                        triangles++;
                        this.indexBuffer.setX(triangles * 3, index + 2);
                        this.indexBuffer.setX(triangles * 3 + 1, index + 1);
                        this.indexBuffer.setX(triangles * 3 + 2, index + 3);
                        triangles++;
                    }
                }
            }
        });
        this.positionBuffer.updateRange.count = index * 3;
        this.positionBuffer.needsUpdate = true;

        this.previousBuffer.updateRange.count = index * 3;
        this.previousBuffer.needsUpdate = true;

        this.nextBuffer.updateRange.count = index * 3;
        this.nextBuffer.needsUpdate = true;

        this.sideBuffer.updateRange.count = index;
        this.sideBuffer.needsUpdate = true;

        this.widthBuffer.updateRange.count = index;
        this.widthBuffer.needsUpdate = true;

        this.uvBuffer.updateRange.count = index * 2;
        this.uvBuffer.needsUpdate = true;

        this.colorBuffer.updateRange.count = index * 4;
        this.colorBuffer.needsUpdate = true;

        this.indexBuffer.updateRange.count = triangles * 3;
        this.indexBuffer.needsUpdate = true;

        this.geometry.setDrawRange(0, triangles * 3);
    }

    dispose() {
        this.geometry.dispose();
    }
}

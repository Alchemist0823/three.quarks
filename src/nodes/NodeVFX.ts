import {IParticle, NodeParticle, Particle, SpriteParticle, TrailParticle} from '../Particle';
import {ParticleEmitter} from '../ParticleEmitter';
import {
    Object3DEventMap,
    BufferGeometry,
    Layers,
    Material,
    Matrix3,
    Matrix4,
    Object3D,
    PlaneGeometry,
    Quaternion,
    Texture,
    Vector3,
} from 'three';
import {RenderMode} from '../VFXBatch';
import {BatchedRenderer, IParticleSystem, SerializationOptions, VFXBatchSettings} from '../BatchedRenderer';
import {NodeGraph} from './NodeGraph';
import {Interpreter} from './Interpreter';
import {ExecutionContext} from './NodeType';
import {BillBoardSettings, MeshSettings, TrailSettings} from '../BatchedRenderer';

const UP = new Vector3(0, 0, 1);
const tempQ = new Quaternion();
const tempV = new Vector3();
const tempV2 = new Vector3();
const PREWARM_FPS = 60;

export interface VFXParameters {
    // parameters
    autoDestroy?: boolean;
    looping?: boolean;
    prewarm?: boolean;
    duration?: number;

    emissionGraph: NodeGraph;
    updateGraph: NodeGraph;

    instancingGeometry?: BufferGeometry;
    renderMode?: RenderMode;
    rendererEmitterSettings?: TrailSettings | MeshSettings | BillBoardSettings;
    speedFactor?: number;
    material: Material;
    layers?: Layers;
    renderOrder?: number;
    worldSpace?: boolean;
}

const DEFAULT_GEOMETRY = new PlaneGeometry(1, 1, 1, 1);

interface EmissionState {
    time: number;
}

/**
 * NodeVFX represents a node graph based visual effect
 *
 * @class
 */
export class NodeVFX implements IParticleSystem {
    emissionGraph: NodeGraph;
    updateGraph: NodeGraph;
    interpreter: Interpreter;

    /**
     * Determines whether the ParticleSystem should be automatically disposed when it finishes emitting particles.
     *
     * @type {boolean}
     */
    autoDestroy: boolean;

    /**
     * Determines whether a looping ParticleSystem should prewarm, i.e., the Particle System looks like it has already simulated for one loop when first becoming visible.
     *
     * @type {boolean}
     */
    prewarm: boolean;

    /**
     * Determines whether the ParticleSystem should loop, i.e., restart emitting particles after the duration of the particle system is expired.
     *
     * @type {boolean}
     */
    looping: boolean;

    /**
     * The duration of the ParticleSystem in seconds.
     *
     * @type {number}
     */
    duration: number;

    /**
     * The number of particles in the ParticleSystem.
     *
     * @type {number}
     */
    particleNum: number;

    /**
     * Determines whether the ParticleSystem is paused.
     *
     * @type {boolean}
     */
    paused: boolean;

    /**
     * All the particles in the ParticleSystem.
     *
     * @type {Array<Particle>}
     */
    particles: Array<IParticle>;

    /**
     * the emitter object that should be added in the scene.
     *
     * @type {ParticleEmitter<Object3DEventMap>}
     */
    emitter: ParticleEmitter<Object3DEventMap>;

    /**
     * the VFX renderer settings for the batch renderer
     *
     * @type {VFXBatchSettings}
     */
    rendererSettings: VFXBatchSettings;

    /**
     * whether needs to update renderer settings for the batch renderer
     *
     * @type {boolean}
     */
    neededToUpdateRender: boolean;

    rendererEmitterSettings: {};
    worldSpace: boolean;

    private prewarmed: boolean;
    private emissionState: EmissionState;
    private emitEnded: boolean;
    private markForDestroy: boolean;
    private previousWorldPos?: Vector3;
    private temp: Vector3 = new Vector3();
    private travelDistance = 0;

    private normalMatrix: Matrix3 = new Matrix3();
    /** @internal **/
    _renderer?: BatchedRenderer;

    set time(time: number) {
        this.emissionState.time = time;
    }

    get time(): number {
        return this.emissionState.time;
    }

    // currently if you change the layers setting, you need manually set this.neededToUpdateRender = true;
    get layers() {
        return this.rendererSettings.layers;
    }

    get texture() {
        return (this.rendererSettings.material as any).map;
    }

    set texture(texture: Texture) {
        (this.rendererSettings.material as any).map = texture;
        this.neededToUpdateRender = true;
        //this.emitter.material.uniforms.map.value = texture;
    }

    get material() {
        return this.rendererSettings.material;
    }

    set material(material: Material) {
        this.rendererSettings.material = material;
        this.neededToUpdateRender = true;
    }

    get instancingGeometry(): BufferGeometry {
        return this.rendererSettings.instancingGeometry;
    }

    set instancingGeometry(geometry: BufferGeometry) {
        this.restart();
        this.particles.length = 0;
        this.rendererSettings.instancingGeometry = geometry;
        this.neededToUpdateRender = true;
    }

    get renderMode(): RenderMode {
        return this.rendererSettings.renderMode;
    }

    set renderMode(renderMode: RenderMode) {
        if (
            (this.rendererSettings.renderMode != RenderMode.Trail && renderMode === RenderMode.Trail) ||
            (this.rendererSettings.renderMode == RenderMode.Trail && renderMode !== RenderMode.Trail)
        ) {
            this.restart();
            this.particles.length = 0;
        }
        if (this.rendererSettings.renderMode !== renderMode) {
            switch (renderMode) {
                case RenderMode.Trail:
                    this.rendererEmitterSettings = {
                        startLength: 30,
                        followLocalOrigin: false,
                    };
                    break;
                case RenderMode.Mesh:
                    this.rendererEmitterSettings = {
                        geometry: new PlaneGeometry(1, 1),
                    };
                    break;
                case RenderMode.BillBoard:
                case RenderMode.VerticalBillBoard:
                case RenderMode.HorizontalBillBoard:
                case RenderMode.StretchedBillBoard:
                    this.rendererEmitterSettings = {};
                    break;
            }
        }
        this.rendererSettings.renderMode = renderMode;
        this.neededToUpdateRender = true;
        //this.emitter.rebuildMaterial();
    }

    get renderOrder(): number {
        return this.rendererSettings.renderOrder;
    }

    set renderOrder(renderOrder: number) {
        this.rendererSettings.renderOrder = renderOrder;
        this.neededToUpdateRender = true;
        //this.emitter.rebuildMaterial();
    }

    get blending() {
        return this.rendererSettings.material.blending;
    }

    set blending(blending) {
        this.rendererSettings.material.blending = blending;
        this.neededToUpdateRender = true;
    }

    constructor(parameters: VFXParameters) {
        this.autoDestroy = parameters.autoDestroy === undefined ? false : parameters.autoDestroy;
        this.duration = parameters.duration ?? 1;
        this.looping = parameters.looping === undefined ? true : parameters.looping;
        this.prewarm = parameters.prewarm === undefined ? false : parameters.prewarm;
        this.worldSpace = parameters.worldSpace ?? false;
        this.rendererEmitterSettings = parameters.rendererEmitterSettings ?? {};
        this.emissionGraph = parameters.emissionGraph;
        this.updateGraph = parameters.updateGraph;
        this.interpreter = new Interpreter();

        this.rendererSettings = {
            instancingGeometry: parameters.instancingGeometry ?? DEFAULT_GEOMETRY,
            renderMode: parameters.renderMode ?? RenderMode.BillBoard,
            renderOrder: parameters.renderOrder ?? 0,
            material: parameters.material,
            layers: parameters.layers ?? new Layers(),
            uTileCount: 1,
            vTileCount: 1,
        };
        this.neededToUpdateRender = true;

        this.particles = new Array<Particle>();
        this.emitter = new ParticleEmitter(this);

        this.paused = false;
        this.particleNum = 0;
        this.emissionState = {
            time: 0,
        };

        this.emitEnded = false;
        this.markForDestroy = false;
        this.prewarmed = false;
    }

    pause() {
        this.paused = true;
    }

    play() {
        this.paused = false;
    }

    private spawn(emissionState: EmissionState, matrix: Matrix4) {
        tempQ.setFromRotationMatrix(matrix);
        const translation = tempV;
        const quaternion = tempQ;
        const scale = tempV2;
        matrix.decompose(translation, quaternion, scale);

        this.particleNum++;
        while (this.particles.length < this.particleNum) {
            /*if (this.rendererSettings.renderMode === RenderMode.Trail) {
                this.particles.push(new TrailParticle());
            } else {
                this.particles.push(new SpriteParticle());
            }*/
            this.particles.push(new NodeParticle());
        }
        const particle = this.particles[this.particleNum - 1];
        (particle as NodeParticle).reset();
        this.interpreter.run(this.updateGraph, {particle: particle, emissionState: this.emissionState});

        if (
            this.rendererSettings.renderMode === RenderMode.Trail &&
            (this.rendererEmitterSettings as TrailSettings).followLocalOrigin
        ) {
            const trail = particle as TrailParticle;
            trail.localPosition = new Vector3().copy(trail.position);
        }
        if (this.worldSpace) {
            particle.position.applyMatrix4(matrix);
            particle.size *= (Math.abs(scale.x) + Math.abs(scale.y) + Math.abs(scale.z)) / 3;
            particle.velocity.multiply(scale).applyMatrix3(this.normalMatrix);
            if (particle.rotation && particle.rotation instanceof Quaternion) {
                particle.rotation.multiplyQuaternions(tempQ, particle.rotation);
            }
        } else {
        }
    }

    endEmit() {
        this.emitEnded = true;
        if (this.autoDestroy) {
            this.markForDestroy = true;
        }
    }

    dispose() {
        if (this._renderer) this._renderer.deleteSystem(this);
        this.emitter.dispose();
        if (this.emitter.parent) this.emitter.parent.remove(this.emitter);
    }

    restart() {
        this.paused = false;
        this.particleNum = 0;
        this.emissionState.time = 0;
        this.emitEnded = false;
        this.markForDestroy = false;
        this.prewarmed = false;
    }

    //firstTimeUpdate = true;

    private update(delta: number) {
        if (this.paused) return;

        let currentParent: Object3D = this.emitter;
        while (currentParent.parent) {
            currentParent = currentParent.parent;
        }
        if (currentParent.type !== 'Scene') {
            this.dispose();
            return;
        }

        if (this.emitEnded && this.particleNum === 0) {
            if (this.markForDestroy && this.emitter.parent) this.dispose();
            return;
        }

        if (this.looping && this.prewarm && !this.prewarmed) {
            this.prewarmed = true;
            for (let i = 0; i < this.duration * PREWARM_FPS; i++) {
                // stack overflow?
                this.update(1.0 / PREWARM_FPS);
            }
        }

        if (delta > 0.1) {
            delta = 0.1;
        }

        if (this.neededToUpdateRender) {
            if (this._renderer) this._renderer.updateSystem(this);
            this.neededToUpdateRender = false;
        }

        this.emit(delta, this.emissionState, this.emitter.matrixWorld);

        // simuate

        const context: any = {particle: undefined, emissionState: this.emissionState, delta};
        for (let i = 0; i < this.particleNum; i++) {
            context.particle = this.particles[i];
            this.interpreter.run(this.updateGraph, context);
        }

        for (let i = 0; i < this.particleNum; i++) {
            if (
                (this.rendererEmitterSettings as TrailSettings).followLocalOrigin &&
                (this.particles[i] as TrailParticle).localPosition
            ) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.particles[i].position.copy((this.particles[i] as TrailParticle).localPosition!);
                if ((this.particles[i] as Particle).parentMatrix) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    this.particles[i].position.applyMatrix4((this.particles[i] as Particle).parentMatrix!);
                } else {
                    this.particles[i].position.applyMatrix4(this.emitter.matrixWorld);
                }
            } else {
                this.particles[i].position.addScaledVector(this.particles[i].velocity, delta);
            }
            this.particles[i].age += delta;
        }

        if (this.rendererSettings.renderMode === RenderMode.Trail) {
            for (let i = 0; i < this.particleNum; i++) {
                const particle = this.particles[i] as TrailParticle;
                particle.update();
            }
        }

        // particle die
        for (let i = 0; i < this.particleNum; i++) {
            const particle = this.particles[i];
            if (particle.died && (!(particle instanceof TrailParticle) || particle.previous.length === 0)) {
                this.particles[i] = this.particles[this.particleNum - 1];
                this.particles[this.particleNum - 1] = particle;
                this.particleNum--;
                i--;
            }
        }
    }

    public emit(delta: number, emissionState: EmissionState, emitterMatrix: Matrix4) {
        if (emissionState.time > this.duration) {
            if (this.looping) {
                emissionState.time -= this.duration;
            } else {
                if (!this.emitEnded) {
                    this.endEmit();
                }
            }
        }
        this.normalMatrix.getNormalMatrix(emitterMatrix);
        // spawn

        // spawn burst
        const context: ExecutionContext = {
            signal: () => {
                this.spawn(emissionState, emitterMatrix);
            },
            emissionState,
            delta,
        };
        if (!this.emitEnded) {
            this.interpreter.run(this.emissionGraph, context);
        }
        if (this.previousWorldPos === undefined) this.previousWorldPos = new Vector3();
        this.emitter.getWorldPosition(this.previousWorldPos);
        emissionState.time += delta;
    }

    toJSON(meta: any, options: SerializationOptions = {}): any {
        return {};
    }

    getRendererSettings() {
        return this.rendererSettings;
    }

    clone(): IParticleSystem {
        return this;
    }

    speedFactor = 0;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    IParticle,
    NodeParticle,
    Particle,
    TrailParticle,
    Matrix3,
    Matrix4,
    Quaternion,
    Vector3,
    SerializationOptions,
    IParticleSystem,
    BillBoardSettings,
    MeshSettings,
    TrailSettings,
    EmissionState,
    IEmitter,
    ValueGeneratorFromJSON,
} from 'quarks.core';
import {
    ParticleEmitter,
    RenderMode,
    BaseBatchedRenderer,
    VFXBatchSettings,
    ParticleSystemEventType,
    ParticleSystemEvent,
    ParticleSimulationDelegate,
    ParticleSystemTypes,
} from 'three.quarks';
import {BufferGeometry, Layers, Material, Object3D, PlaneGeometry, Texture} from 'three';
import {NodeGraph, NodeGraphJSON} from './NodeGraph';
import {getInterpreter, Interpreter} from './Interpreter';
import {ExecutionContext} from './NodeDef';

const tempQ = new Quaternion();
const tempV = new Vector3();
const tempV2 = new Vector3();
const PREWARM_FPS = 60;

export interface VFXParameters {
    autoDestroy?: boolean;
    looping?: boolean;
    prewarm?: boolean;
    duration?: number;

    /** runs every step; its `emit` node spawns one particle per event */
    emissionGraph: NodeGraph;
    /**
     * runs once for every spawned particle (start position, velocity, color, life, ...). Without it, the update
     * graph also runs at spawn (with `delta` 0), as in earlier versions.
     */
    initGraph?: NodeGraph;
    /** runs for every particle every step, before position += velocity * delta and age += delta */
    updateGraph: NodeGraph;
    /** values read / written by `graphProperty` nodes */
    properties?: {[key: string]: any};

    instancingGeometry?: BufferGeometry;
    renderMode?: RenderMode;
    rendererEmitterSettings?: TrailSettings | MeshSettings | BillBoardSettings | {[key: string]: any};
    material: Material;
    layers?: Layers;
    renderOrder?: number;
    worldSpace?: boolean;
    uTileCount?: number;
    vTileCount?: number;
    blendTiles?: boolean;
    softParticles?: boolean;
    softNearFade?: number;
    softFarFade?: number;
    /**
     * expected maximum number of live particles: sizes the GPU buffers and lets `gpuSimulation: 'auto'` decide
     * (unknown without it, so 'auto' keeps the effect on the CPU)
     */
    maxParticles?: number;
    /** @deprecated use maxParticles */
    maxParticle?: number;
}

const DEFAULT_GEOMETRY = new PlaneGeometry(1, 1, 1, 1);

/**
 * A node graph based visual effect.
 *
 * Three graphs describe it: the emission graph spawns particles (`emit` events from `startEvent`, `rate`,
 * `repeater`, ...), the init graph sets up each spawned particle and the update graph runs on every particle every
 * step (`particleProperty` nodes read and write the particle). The graphs run in the CPU {@link Interpreter}; with
 * `three.quarks/webgpu` and `quarks.nodes/webgpu`, the update graph is compiled to a TSL compute shader and the
 * particles are simulated on the GPU (`gpuSimulation` option of the batch renderer).
 */
export class NodeVFX implements IParticleSystem {
    readonly isNodeVFX = true;
    emissionGraph: NodeGraph;
    initGraph: NodeGraph | null;
    updateGraph: NodeGraph;
    /** values of `graphProperty` nodes */
    properties: {[key: string]: any};
    interpreter: Interpreter;

    /**
     * Determines whether the system should be automatically disposed when it finishes emitting particles.
     */
    autoDestroy: boolean;

    /**
     * Whether a looping system starts as if it had already simulated one loop.
     */
    prewarm: boolean;

    /**
     * Whether the system restarts emitting after `duration`.
     */
    looping: boolean;

    /**
     * The duration of one loop, in seconds.
     */
    duration: number;

    /** The number of live particles. */
    particleNum: number;

    /** Whether the simulation is paused. */
    paused: boolean;

    /**
     * The particles (CPU simulation). With a {@link simulationDelegate}, only the particles spawned since the last
     * step.
     */
    particles: Array<IParticle>;

    /** expected maximum number of live particles (see {@link VFXParameters.maxParticles}) */
    maxParticles: number | null;

    /**
     * Simulates the particles instead of the CPU interpreter when set (GPU simulation, see
     * `ParticleSimulationDelegate`).
     */
    simulationDelegate: ParticleSimulationDelegate | null = null;
    /** @internal particles spawned since the last step while a delegate is set */
    pendingSpawnCount = 0;

    /** the emitter object that should be added to the scene */
    emitter: IEmitter;

    /** the renderer settings for the batch renderer */
    rendererSettings: VFXBatchSettings;

    /** whether the batch renderer has to re-read the renderer settings */
    neededToUpdateRender: boolean;

    rendererEmitterSettings: any;
    worldSpace: boolean;
    onlyUsedByOther = false;

    private prewarmed: boolean;
    emissionState: EmissionState;
    private emitEnded: boolean;
    private markForDestroy: boolean;
    private isStart = true;

    private normalMatrix: Matrix3 = new Matrix3();
    /** @internal **/
    _renderer?: BaseBatchedRenderer;

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
                    this.rendererEmitterSettings = {startLength: 30, followLocalOrigin: false};
                    break;
                case RenderMode.Mesh:
                    this.rendererEmitterSettings = {geometry: new PlaneGeometry(1, 1)};
                    break;
                case RenderMode.StretchedBillBoard:
                    this.rendererEmitterSettings = {speedFactor: 0, lengthFactor: 2};
                    break;
                default:
                    this.rendererEmitterSettings = {};
                    break;
            }
        }
        this.rendererSettings.renderMode = renderMode;
        this.neededToUpdateRender = true;
    }

    get renderOrder(): number {
        return this.rendererSettings.renderOrder;
    }

    set renderOrder(renderOrder: number) {
        this.rendererSettings.renderOrder = renderOrder;
        this.neededToUpdateRender = true;
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
        this.initGraph = parameters.initGraph ?? null;
        this.updateGraph = parameters.updateGraph;
        this.properties = parameters.properties ?? {};
        this.maxParticles = parameters.maxParticles ?? parameters.maxParticle ?? null;
        this.interpreter = getInterpreter();

        this.rendererSettings = {
            instancingGeometry: parameters.instancingGeometry ?? DEFAULT_GEOMETRY,
            renderMode: parameters.renderMode ?? RenderMode.BillBoard,
            renderOrder: parameters.renderOrder ?? 0,
            material: parameters.material,
            layers: parameters.layers ?? new Layers(),
            uTileCount: parameters.uTileCount ?? 1,
            vTileCount: parameters.vTileCount ?? 1,
            blendTiles: parameters.blendTiles ?? false,
            softParticles: parameters.softParticles ?? false,
            softNearFade: parameters.softNearFade ?? 0,
            softFarFade: parameters.softFarFade ?? 0,
        };
        this.neededToUpdateRender = true;

        this.particles = new Array<Particle>();
        this.emitter = new ParticleEmitter(this as any);

        this.paused = false;
        this.particleNum = 0;
        this.emissionState = {
            burstIndex: 0,
            burstParticleCount: 0,
            burstParticleIndex: 0,
            burstWaveIndex: 0,
            isBursting: false,
            travelDistance: 0,
            waitEmiting: 0,
            time: 0,
        };

        this.emitEnded = false;
        this.markForDestroy = false;
        this.prewarmed = false;
    }

    stop(): void {
        this.restart();
        this.pause();
    }

    pause() {
        this.paused = true;
    }

    play() {
        this.paused = false;
    }

    private spawnContext_: ExecutionContext = {};

    private spawn(emissionState: EmissionState, matrix: Matrix4) {
        matrix.decompose(tempV, tempQ, tempV2);
        const scale = tempV2;

        const index = this.simulationDelegate ? this.pendingSpawnCount++ : this.particleNum++;
        const trail = this.rendererSettings.renderMode === RenderMode.Trail;
        while (this.particles.length <= index) {
            this.particles.push(trail ? new TrailParticle() : new NodeParticle());
        }
        let particle = this.particles[index];
        if (trail !== particle instanceof TrailParticle) {
            particle = this.particles[index] = trail ? new TrailParticle() : new NodeParticle();
        }
        (particle as NodeParticle).reset();
        if (trail) {
            const length = (this.rendererEmitterSettings as TrailSettings).startLength as any;
            (particle as TrailParticle).length =
                typeof length === 'number' ? length : length && length.genValue ? length.genValue(particle.memory) : 30;
        }

        const context = this.spawnContext_;
        context.particle = particle;
        context.emissionState = emissionState;
        context.delta = 0;
        context.graph = this.properties;
        this.interpreter.run(this.initGraph ?? this.updateGraph, context);

        if (trail && (this.rendererEmitterSettings as TrailSettings).followLocalOrigin) {
            (particle as TrailParticle).localPosition = new Vector3().copy(particle.position);
        }
        if (this.worldSpace) {
            particle.position.applyMatrix4(matrix);
            particle.size.multiply(scale).abs();
            particle.velocity.multiply(scale).applyMatrix3(this.normalMatrix);
            if (particle.rotation && particle.rotation instanceof Quaternion) {
                particle.rotation.multiplyQuaternions(tempQ, particle.rotation);
            }
        }
    }

    endEmit() {
        this.emitEnded = true;
        if (this.autoDestroy) {
            this.markForDestroy = true;
        }
        this.fire({type: 'emitEnd', particleSystem: this as any});
    }

    dispose() {
        if (this._renderer) this._renderer.deleteSystem(this);
        const emitter = this.emitter as unknown as ParticleEmitter;
        emitter.dispose();
        if (emitter.parent) emitter.parent!.remove(emitter);
        this.fire({type: 'destroy', particleSystem: this as any});
    }

    restart() {
        if (this.simulationDelegate) this.simulationDelegate.clear();
        this.pendingSpawnCount = 0;
        this.paused = false;
        this.particleNum = 0;
        this.emissionState.time = 0;
        this.emissionState.waitEmiting = 0;
        this.emitEnded = false;
        this.markForDestroy = false;
        this.prewarmed = false;
        this.isStart = true;
        // runtime state of emission nodes (e.g. `rate` accumulators)
        for (const node of this.emissionGraph.allNodes.values()) {
            for (const key of Object.keys(node.data)) if (key.startsWith('_')) delete node.data[key];
        }
    }

    private updateContext_: ExecutionContext = {};

    private update(delta: number) {
        if (this.paused) return;

        const emitter = this.emitter as unknown as Object3D;
        let currentParent: Object3D = emitter;
        while (currentParent.parent) {
            currentParent = currentParent.parent;
        }
        if (currentParent.type !== 'Scene') {
            this.dispose();
            return;
        }

        if (this.emitEnded && this.particleNum === 0) {
            if (this.markForDestroy && emitter.parent) this.dispose();
            return;
        }

        if (this.looping && this.prewarm && !this.prewarmed) {
            this.prewarmed = true;
            for (let i = 0; i < this.duration * PREWARM_FPS; i++) {
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

        this.emit(delta, this.emissionState, emitter.matrixWorld as unknown as Matrix4);

        if (this.simulationDelegate) {
            const spawned = this.pendingSpawnCount;
            this.pendingSpawnCount = 0;
            this.particleNum = this.simulationDelegate.step(this as any, spawned, delta);
            return;
        }

        // simulate
        const context = this.updateContext_;
        context.emissionState = this.emissionState;
        context.delta = delta;
        context.graph = this.properties;
        for (let i = 0; i < this.particleNum; i++) {
            context.particle = this.particles[i];
            this.interpreter.run(this.updateGraph, context);
        }

        for (let i = 0; i < this.particleNum; i++) {
            const particle = this.particles[i];
            if ((this.rendererEmitterSettings as TrailSettings).followLocalOrigin && (particle as TrailParticle).localPosition) {
                particle.position.copy((particle as TrailParticle).localPosition!);
                if ((particle as Particle).parentMatrix) {
                    particle.position.applyMatrix4((particle as Particle).parentMatrix!);
                } else {
                    particle.position.applyMatrix4(emitter.matrixWorld as unknown as Matrix4);
                }
            } else {
                particle.position.addScaledVector(particle.velocity, delta);
            }
            particle.age += delta;
        }

        if (this.rendererSettings.renderMode === RenderMode.Trail) {
            for (let i = 0; i < this.particleNum; i++) {
                (this.particles[i] as TrailParticle).update();
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
                this.fire({type: 'particleDied', particleSystem: this as any, particle: particle as any});
            }
        }
    }

    private emitContext_: ExecutionContext = {};

    public emit(delta: number, emissionState: EmissionState, emitterMatrix: Matrix4) {
        if (emissionState.time > this.duration) {
            if (this.looping) {
                emissionState.time -= this.duration;
                this.isStart = true;
            } else if (!this.emitEnded) {
                this.endEmit();
            }
        }
        this.normalMatrix.getNormalMatrix(emitterMatrix);

        const context = this.emitContext_;
        context.signal = () => this.spawn(emissionState, emitterMatrix);
        context.emissionState = emissionState;
        context.delta = delta;
        context.graph = this.properties;
        context.isStart = this.isStart;
        if (!this.emitEnded) {
            this.interpreter.run(this.emissionGraph, context);
        }
        this.isStart = false;
        if (emissionState.previousWorldPos === undefined) emissionState.previousWorldPos = new Vector3();
        (this.emitter as unknown as Object3D).getWorldPosition(emissionState.previousWorldPos as any);
        emissionState.time += delta;
    }

    toJSON(meta: any, options: SerializationOptions = {}): any {
        void options;
        if (meta === undefined || typeof meta === 'string') {
            meta = {geometries: {}, materials: {}, textures: {}, images: {}, shapes: {}, skeletons: {}, animations: {}};
        }
        const material = this.rendererSettings.material;
        if (meta.materials && !meta.materials[material.uuid]) meta.materials[material.uuid] = material.toJSON(meta);
        const geometry = this.rendererSettings.instancingGeometry;
        if (meta.geometries && !meta.geometries[geometry.uuid]) meta.geometries[geometry.uuid] = geometry.toJSON();

        const settings: any = {...this.rendererEmitterSettings};
        if (settings.startLength && typeof settings.startLength !== 'number' && settings.startLength.toJSON) {
            settings.startLength = settings.startLength.toJSON();
        }
        delete settings.geometry;
        return {
            type: 'NodeVFX',
            version: '1.0',
            autoDestroy: this.autoDestroy,
            looping: this.looping,
            prewarm: this.prewarm,
            duration: this.duration,
            worldSpace: this.worldSpace,
            maxParticles: this.maxParticles,
            emissionGraph: this.emissionGraph.toJSON(),
            initGraph: this.initGraph ? this.initGraph.toJSON() : null,
            updateGraph: this.updateGraph.toJSON(),
            properties: this.properties,
            instancingGeometry: geometry.uuid,
            renderMode: this.renderMode,
            renderOrder: this.renderOrder,
            rendererEmitterSettings: settings,
            material: material.uuid,
            layers: this.layers.mask,
            uTileCount: this.rendererSettings.uTileCount,
            vTileCount: this.rendererSettings.vTileCount,
            blendTiles: this.rendererSettings.blendTiles,
            softParticles: this.rendererSettings.softParticles,
            softNearFade: this.rendererSettings.softNearFade,
            softFarFade: this.rendererSettings.softFarFade,
        };
    }

    /**
     * Creates a NodeVFX from {@link toJSON} output.
     * @param meta `materials` and `geometries` by uuid (as `QuarksLoader` provides them)
     */
    static fromJSON(json: any, meta: {materials: {[uuid: string]: Material}; geometries: {[uuid: string]: BufferGeometry}}): NodeVFX {
        const settings: any = {...(json.rendererEmitterSettings ?? {})};
        if (settings.startLength !== undefined && typeof settings.startLength !== 'number') {
            settings.startLength = ValueGeneratorFromJSON(settings.startLength);
        }
        const layers = new Layers();
        if (json.layers !== undefined) layers.mask = json.layers;
        return new NodeVFX({
            autoDestroy: json.autoDestroy,
            looping: json.looping,
            prewarm: json.prewarm,
            duration: json.duration,
            worldSpace: json.worldSpace,
            maxParticles: json.maxParticles ?? undefined,
            emissionGraph: NodeGraph.fromJSON(json.emissionGraph as NodeGraphJSON),
            initGraph: json.initGraph ? NodeGraph.fromJSON(json.initGraph as NodeGraphJSON) : undefined,
            updateGraph: NodeGraph.fromJSON(json.updateGraph as NodeGraphJSON),
            properties: json.properties ? JSON.parse(JSON.stringify(json.properties)) : {},
            instancingGeometry: meta.geometries ? meta.geometries[json.instancingGeometry] : undefined,
            renderMode: json.renderMode,
            renderOrder: json.renderOrder,
            rendererEmitterSettings: settings,
            material: meta.materials[json.material],
            layers,
            uTileCount: json.uTileCount,
            vTileCount: json.vTileCount,
            blendTiles: json.blendTiles,
            softParticles: json.softParticles,
            softNearFade: json.softNearFade,
            softFarFade: json.softFarFade,
        });
    }

    getRendererSettings() {
        return this.rendererSettings;
    }

    clone(): IParticleSystem {
        const meta = {
            materials: {[this.material.uuid]: this.material} as {[uuid: string]: Material},
            geometries: {[this.instancingGeometry.uuid]: this.instancingGeometry} as {[uuid: string]: BufferGeometry},
        };
        const json = this.toJSON({materials: {}, geometries: {}, textures: {}, images: {}});
        const vfx = NodeVFX.fromJSON(json, meta);
        // fresh graph instances with their own runtime state
        vfx.emissionGraph = this.emissionGraph.clone();
        vfx.updateGraph = this.updateGraph.clone();
        vfx.initGraph = this.initGraph ? this.initGraph.clone() : null;
        return vfx as unknown as IParticleSystem;
    }

    private listeners: {[event: string]: Array<(event: ParticleSystemEvent) => void>} = {};

    addEventListener(event: ParticleSystemEventType, callback: (event: ParticleSystemEvent) => void): void {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }

    removeAllEventListeners(event: ParticleSystemEventType): void {
        if (this.listeners[event]) this.listeners[event] = [];
    }

    removeEventListener(event: ParticleSystemEventType, callback: (event: ParticleSystemEvent) => void): void {
        if (this.listeners[event]) {
            const index = this.listeners[event].indexOf(callback);
            if (index !== -1) {
                this.listeners[event].splice(index, 1);
            }
        }
    }

    private fire(event: ParticleSystemEvent) {
        if (this.listeners[event.type]) {
            this.listeners[event.type].forEach((callback) => callback(event));
        }
    }
}

ParticleSystemTypes['NodeVFX'] = (json, meta) => NodeVFX.fromJSON(json, meta) as unknown as IParticleSystem;

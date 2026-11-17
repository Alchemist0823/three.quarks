/* eslint-disable @typescript-eslint/no-explicit-any */
import {InstancedBufferGeometry, Material, Texture} from 'three';
import {VFXBatch} from 'three.quarks';
import type {IParticleSystem, ParticleSystem, VFXBatchSettings} from 'three.quarks';
import {CompositingSource, createSpriteBatchMaterial, isPendingCubeTexture} from '../WebGPUBatches';
import {createPerformanceProfile, QuarksPerformanceProfile} from '../PerformanceProfile';
import {GPUParticleSimulation, GPUSimulationHost} from './GPUParticleSimulation';

/**
 * Renders one GPU simulated particle system ({@link GPUParticleSimulation}): an instanced draw of `highWater`
 * particles that reads every per-particle value from the simulation's storage buffer. Nothing is uploaded per frame
 * except the particles spawned in the frame.
 *
 * GPU simulated systems are not merged into shared batches: each has its own buffers, kernels and draw call.
 */
export class GPUParticleBatch extends VFXBatch {
    readonly isWebGPUBatch = true;
    readonly isGPUParticleBatch = true;
    declare geometry: InstancedBufferGeometry;
    profile: QuarksPerformanceProfile;
    simulation: GPUParticleSimulation | null = null;

    private depthTexture_: Texture | null = null;
    private pendingEnvMap_: Texture | null = null;
    private materialGeneration_ = -1;

    constructor(
        settings: VFXBatchSettings,
        private readonly host: GPUSimulationHost,
        profile: QuarksPerformanceProfile = createPerformanceProfile(),
        private readonly compositingSource: CompositingSource | null = null
    ) {
        super(settings);
        this.shareable = false;
        this.profile = profile;
        this.setupBuffers();
    }

    /** the simulated system */
    get system(): ParticleSystem | null {
        return this.simulation ? this.simulation.system : null;
    }

    /**
     * Starts rendering `system`.
     * @param simulation an existing simulation of the system to take over (renderer settings changed), otherwise a
     *   new one is created
     */
    addSystem(system: IParticleSystem, simulation?: GPUParticleSimulation) {
        if (this.systems.size > 0) throw new Error('GPUParticleBatch renders a single particle system');
        super.addSystem(system);
        const particleSystem = system as unknown as ParticleSystem;
        if (simulation && simulation.system === particleSystem) {
            this.simulation = simulation;
        } else {
            this.simulation = new GPUParticleSimulation(particleSystem, this.host);
            if (!particleSystem.simulationDelegate) {
                // particles simulated on the CPU so far continue on the GPU: they are uploaded like spawned ones
                particleSystem.pendingSpawnCount = particleSystem.particleNum;
                particleSystem.particleNum = 0;
            }
        }
        particleSystem.simulationDelegate = this.simulation;
        this.rebuildMaterial();
    }

    /**
     * Stops rendering `system` and disposes its simulation. Particles spawned since the last step are kept as CPU
     * particles; the particles on the GPU are lost.
     */
    removeSystem(system: IParticleSystem) {
        super.removeSystem(system);
        const particleSystem = system as unknown as ParticleSystem;
        if (this.simulation && particleSystem.simulationDelegate === this.simulation) {
            particleSystem.simulationDelegate = null;
            particleSystem.particleNum = particleSystem.pendingSpawnCount;
            particleSystem.pendingSpawnCount = 0;
        }
        this.simulation?.dispose();
        this.simulation = null;
        this.geometry.instanceCount = 0;
    }

    /** Detaches the simulation (to hand it to another batch) without disposing it. */
    detachSimulation(): GPUParticleSimulation | null {
        const simulation = this.simulation;
        this.simulation = null;
        this.systems.clear();
        this.geometry.instanceCount = 0;
        return simulation;
    }

    setupBuffers(): void {
        if (this.geometry) this.geometry.dispose();
        const source = this.settings.instancingGeometry;
        this.geometry = new InstancedBufferGeometry();
        this.geometry.instanceCount = 0;
        this.geometry.setIndex(source.getIndex());
        this.geometry.setAttribute('position', source.getAttribute('position'));
        if (source.hasAttribute('normal')) this.geometry.setAttribute('normal', source.getAttribute('normal'));
        if (source.hasAttribute('uv')) this.geometry.setAttribute('uv', source.getAttribute('uv'));
    }

    expandBuffers(): void {
        // the simulation grows its own storage
    }

    rebuildMaterial() {
        this.layers.mask = this.settings.layers.mask;
        const simulation = this.simulation;
        if (!simulation) return;
        const compositing = this.compositingSource ? this.compositingSource.compositing : null;
        const {material, pendingEnvMap} = createSpriteBatchMaterial(
            this.settings,
            this.profile,
            this.depthTexture_,
            compositing,
            simulation.createRenderFields()
        );
        this.pendingEnvMap_ = pendingEnvMap;
        this.materialGeneration_ = simulation.generation;
        const previous = this.material as Material;
        this.material = material;
        if (previous && previous !== material && (previous as any).isNodeMaterial) previous.dispose();
    }

    update() {
        const simulation = this.simulation;
        if (!simulation) {
            this.visible = false;
            return;
        }
        this.visible = simulation.system.emitter.visible;
        if (simulation.generation !== this.materialGeneration_) this.rebuildMaterial();
        if (this.pendingEnvMap_ && !isPendingCubeTexture(this.pendingEnvMap_)) {
            this.pendingEnvMap_ = null;
            this.rebuildMaterial();
        }
        simulation.updateRenderUniforms();
        this.geometry.instanceCount = simulation.highWater;
    }

    applyDepthTexture(depthTexture: Texture | null): void {
        if (this.depthTexture_ === depthTexture) return;
        this.depthTexture_ = depthTexture;
        if (this.settings.softParticles && this.profile.softParticles) this.rebuildMaterial();
    }

    dispose() {
        for (const system of Array.from(this.systems)) this.removeSystem(system);
        this.geometry.dispose();
        (this.material as Material).dispose();
    }
}

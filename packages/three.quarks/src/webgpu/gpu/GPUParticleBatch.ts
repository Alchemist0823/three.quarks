/* eslint-disable @typescript-eslint/no-explicit-any */
import {InstancedBufferGeometry, Material, Texture} from 'three';
import {VFXBatch} from 'three.quarks';
import type {IParticleSystem, VFXBatchSettings} from 'three.quarks';
import {CompositingSource, createSpriteBatchMaterial, isPendingCubeTexture} from '../WebGPUBatches';
import {createPerformanceProfile, QuarksPerformanceProfile} from '../PerformanceProfile';
import {
    GPUParticleBatchSimulation,
    GPUSimulatedSystem,
    GPUSimulationHost,
    GPUSimulationMember,
} from './GPUParticleSimulation';

/**
 * Renders the GPU simulated particle systems that share renderer settings, like a CPU batch does: one storage buffer
 * of particles ({@link GPUParticleBatchSimulation}), one material and **one indirect draw call** whose instance count
 * (the high-water mark of live particles) is written by the simulation's kernels. Every per-particle value is read
 * from the simulation's buffers; per frame the CPU only uploads emission calls and a few floats per system.
 */
export class GPUParticleBatch extends VFXBatch {
    readonly isWebGPUBatch = true;
    readonly isGPUParticleBatch = true;
    declare geometry: InstancedBufferGeometry;
    profile: QuarksPerformanceProfile;
    readonly simulation: GPUParticleBatchSimulation;

    private depthTexture_: Texture | null = null;
    private pendingEnvMap_: Texture | null = null;
    private materialGeneration_ = -1;

    constructor(
        settings: VFXBatchSettings,
        host: GPUSimulationHost,
        layoutOptions: {mesh: boolean; noise: boolean},
        profile: QuarksPerformanceProfile = createPerformanceProfile(),
        private readonly compositingSource: CompositingSource | null = null
    ) {
        super(settings);
        // CPU simulated systems never join; GPU systems are grouped by the WebGPUBatchedRenderer
        this.shareable = false;
        this.profile = profile;
        this.simulation = new GPUParticleBatchSimulation(layoutOptions, host);
        this.setupBuffers();
        this.rebuildMaterial();
    }

    /** The simulation member of a system of this batch. */
    memberOf(system: IParticleSystem): GPUSimulationMember | undefined {
        return this.simulation.memberOf(system);
    }

    /** Starts simulating `system` here; particles it simulated on the CPU continue on the GPU. */
    addSystem(system: IParticleSystem) {
        super.addSystem(system);
        const particleSystem = system as unknown as GPUSimulatedSystem;
        const member = this.simulation.addSystem(particleSystem);
        if (!particleSystem.simulationDelegate) {
            // live CPU particles are uploaded like spawned ones (they keep their age)
            particleSystem.pendingSpawnCount = particleSystem.particleNum;
            particleSystem.particleNum = 0;
        }
        particleSystem.simulationDelegate = member;
    }

    /**
     * Takes over `system` from another GPU batch with the same particle layout, keeping its live particles.
     */
    adoptSystem(system: IParticleSystem, from: GPUParticleBatch) {
        const member = from.memberOf(system);
        if (!member) throw new Error('GPUParticleBatch.adoptSystem: the system is not simulated by that batch');
        VFXBatch.prototype.removeSystem.call(from, system);
        VFXBatch.prototype.addSystem.call(this, system);
        const moved = from.simulation.transferTo(member, this.simulation);
        (system as unknown as GPUSimulatedSystem).simulationDelegate = moved;
    }

    /**
     * Stops simulating `system`. Particles spawned since its last step become CPU particles; its GPU particles are
     * removed.
     */
    removeSystem(system: IParticleSystem) {
        super.removeSystem(system);
        const particleSystem = system as unknown as GPUSimulatedSystem;
        const member = this.simulation.memberOf(system);
        if (!member) return;
        this.simulation.removeSystem(member);
        if (particleSystem.simulationDelegate === member) {
            particleSystem.simulationDelegate = null;
            particleSystem.particleNum = particleSystem.pendingSpawnCount;
            particleSystem.pendingSpawnCount = 0;
        }
    }

    setupBuffers(): void {
        if (this.geometry) this.geometry.dispose();
        const source = this.settings.instancingGeometry;
        this.geometry = new InstancedBufferGeometry();
        this.geometry.setIndex(source.getIndex());
        this.geometry.setAttribute('position', source.getAttribute('position'));
        if (source.hasAttribute('normal')) this.geometry.setAttribute('normal', source.getAttribute('normal'));
        if (source.hasAttribute('uv')) this.geometry.setAttribute('uv', source.getAttribute('uv'));
        // the instance count comes from the GPU; three.js only needs a non-zero CPU count to issue the draw
        const index = source.getIndex();
        this.simulation.setDrawCount(index ? index.count : source.getAttribute('position').count);
        this.geometry.setIndirect(this.simulation.drawArgs as any);
        this.geometry.instanceCount = this.simulation.capacity;
    }

    expandBuffers(): void {
        // the simulation grows its own storage
    }

    rebuildMaterial() {
        this.layers.mask = this.settings.layers.mask;
        const compositing = this.compositingSource ? this.compositingSource.compositing : null;
        const {material, pendingEnvMap} = createSpriteBatchMaterial(
            this.settings,
            this.profile,
            this.depthTexture_,
            compositing,
            this.simulation.createRenderFields()
        );
        this.pendingEnvMap_ = pendingEnvMap;
        this.materialGeneration_ = this.simulation.generation;
        const previous = this.material as Material;
        this.material = material;
        if (previous && previous !== material && (previous as any).isNodeMaterial) previous.dispose();
    }

    update() {
        const simulation = this.simulation;
        this.visible = simulation.members.length > 0;
        if (simulation.generation !== this.materialGeneration_) this.rebuildMaterial();
        if (this.pendingEnvMap_ && !isPendingCubeTexture(this.pendingEnvMap_)) {
            this.pendingEnvMap_ = null;
            this.rebuildMaterial();
        }
        simulation.updateRenderData();
        this.geometry.instanceCount = simulation.capacity;
    }

    applyDepthTexture(depthTexture: Texture | null): void {
        if (this.depthTexture_ === depthTexture) return;
        this.depthTexture_ = depthTexture;
        if (this.settings.softParticles && this.profile.softParticles) this.rebuildMaterial();
    }

    dispose() {
        for (const system of Array.from(this.systems)) this.removeSystem(system);
        this.simulation.dispose();
        this.geometry.dispose();
        (this.material as Material).dispose();
    }
}

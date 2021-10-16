import {ParticleSystemBatch, ParticleSystemBatchSettings} from "./ParticleSystemBatch";
import {ParticleSystem} from "./ParticleSystem";
import {Group, Object3D} from "three";


export class BatchedParticleRenderer extends Object3D {
    batches: Array<ParticleSystemBatch> = [];
    type: string = "BatchedParticleRenderer";

    constructor() {
        super();
    }

    private static equals(a: ParticleSystemBatchSettings, b: ParticleSystemBatchSettings) {
        return a.texture === b.texture &&
            a.blending === b.blending &&
            a.renderMode === b.renderMode &&
            a.uTileCount === b.uTileCount &&
            a.vTileCount === b.vTileCount &&
            a.instancingGeometry === b.instancingGeometry &&
            a.renderOrder === b.renderOrder;
    }

    addSystem(system: ParticleSystem) {
        const settings = system.getRendererSettings();
        for (let i = 0; i < this.batches.length; i++) {
            if (BatchedParticleRenderer.equals(this.batches[i].settings, settings)) {
                this.batches[i].addSystem(system);
                return;
            }
        }
        let batch = new ParticleSystemBatch(settings);
        batch.addSystem(system);
        this.batches.push(batch);
        this.add(batch);
    }

    deleteSystem(system: ParticleSystem) {
        const settings = system.getRendererSettings();
        for (let i = 0; i < this.batches.length; i++) {
            if (BatchedParticleRenderer.equals(this.batches[i].settings, settings)) {
                this.batches[i].removeSystem(system);
                return;
            }
        }
    }

    updateSystem(system: ParticleSystem) {

    }

    update() {
        for (let i = 0; i < this.batches.length; i++) {
            this.batches[i].update();
        }
    }
}

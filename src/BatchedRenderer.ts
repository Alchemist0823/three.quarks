import {VFXBatch, VFXBatchSettings, RenderMode} from "./VFXBatch";
import {ParticleSystem} from "./ParticleSystem";
import {Object3D} from "three";
import { SpriteBatch } from "./SpriteBatch";
import {TrailBatch} from "./TrailBatch";

export class BatchedRenderer extends Object3D {
    batches: Array<VFXBatch> = [];
    systemToBatchIndex: Map<ParticleSystem, number> = new Map<ParticleSystem, number>();
    type: string = "BatchedRenderer";

    constructor() {
        super();
    }

    private static equals(a: VFXBatchSettings, b: VFXBatchSettings) {
        return a.texture === b.texture &&
            a.blending === b.blending &&
            a.renderMode === b.renderMode &&
            a.uTileCount === b.uTileCount &&
            a.vTileCount === b.vTileCount &&
            a.instancingGeometry === b.instancingGeometry &&
            a.transparent === b.transparent &&
            a.renderOrder === b.renderOrder;
    }

    addSystem(system: ParticleSystem) {
        const settings = system.getRendererSettings();
        for (let i = 0; i < this.batches.length; i++) {
            if (BatchedRenderer.equals(this.batches[i].settings, settings)) {
                this.batches[i].addSystem(system);
                this.systemToBatchIndex.set(system, i);
                return;
            }
        }
        let batch;
        switch (settings.renderMode) {
            case RenderMode.Trail:
                batch = new TrailBatch(settings);
                break;
            case RenderMode.Mesh:
            case RenderMode.BillBoard:
            case RenderMode.StretchedBillBoard:
                batch = new SpriteBatch(settings);
                break;
        }
        batch.addSystem(system);
        this.batches.push(batch);
        this.systemToBatchIndex.set(system, this.batches.length - 1);
        this.add(batch);
    }

    deleteSystem(system: ParticleSystem) {
        let batchIndex = this.systemToBatchIndex.get(system);
        if (batchIndex != undefined) {
            this.batches[batchIndex].removeSystem(system);
            this.systemToBatchIndex.delete(system);
        }
        /*const settings = system.getRendererSettings();
        for (let i = 0; i < this.batches.length; i++) {
            if (BatchedParticleRenderer.equals(this.batches[i].settings, settings)) {
                this.batches[i].removeSystem(system);
                return;
            }
        }*/
    }

    updateSystem(system: ParticleSystem) {
        this.deleteSystem(system);
        this.addSystem(system);
    }

    update(delta: number) {
        this.systemToBatchIndex.forEach((value, ps) => {
            (ps as any).update(delta);
        });
        for (let i = 0; i < this.batches.length; i++) {
            this.batches[i].update();
        }
    }
}

import {IParticleSystem} from 'quarks.core';
import {BufferGeometry, Layers, MeshBasicMaterial, Object3D} from 'three';

import {VFXBatchSettings} from '../src/BatchedRenderer';
import {RenderMode, VFXBatch} from '../src/VFXBatch';

class TestBatch extends VFXBatch {
    constructor() {
        super(createBatchSettings());
    }

    collect(out: IParticleSystem[]): IParticleSystem[] {
        return this.collectVisibleSystems(out);
    }

    setupBuffers(): void {}
    expandBuffers(target: number): void {}
    rebuildMaterial(): void {}
    update(): void {}
    dispose(): void {}
}

function createBatchSettings(): VFXBatchSettings {
    return {
        instancingGeometry: new BufferGeometry(),
        material: new MeshBasicMaterial(),
        uTileCount: 1,
        vTileCount: 1,
        blendTiles: false,
        softParticles: false,
        softNearFade: 0,
        softFarFade: 0,
        renderMode: RenderMode.BillBoard,
        renderOrder: 0,
        layers: new Layers(),
    };
}

function createSystem(visible: boolean): IParticleSystem {
    const emitter = new Object3D();
    emitter.visible = visible;

    return {emitter} as unknown as IParticleSystem;
}

describe('VFXBatch', () => {
    test('getVisibleSystems returns a fresh visible-system array', () => {
        const batch = new TestBatch();
        const visible = createSystem(true);
        const hidden = createSystem(false);

        batch.addSystem(visible);
        batch.addSystem(hidden);

        const first = batch.getVisibleSystems();
        const second = batch.getVisibleSystems();

        expect(first).toEqual([visible]);
        expect(second).toEqual([visible]);
        expect(first).not.toBe(second);
    });

    test('collectVisibleSystems clears and reuses the provided array', () => {
        const batch = new TestBatch();
        const stale = createSystem(true);
        const visible = createSystem(true);
        const hidden = createSystem(false);
        const scratch = [stale];

        batch.addSystem(visible);
        batch.addSystem(hidden);

        const result = batch.collect(scratch);

        expect(result).toBe(scratch);
        expect(result).toEqual([visible]);
    });
});

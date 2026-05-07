import {Vector3 as BVector3} from '@babylonjs/core/Maths/math.vector';
import {QuarksLoader} from 'babylon.quarks';

async function loadEffectAndAttach({scene, batchRenderer, systems, path, positionX, scale, trackedSystems}) {
    const loader = new QuarksLoader(scene, {baseUrl: ''});
    const effect = await loader.load(path);
    effect.parent = batchRenderer;
    effect.position.x = positionX;
    if (scale !== undefined) {
        effect.scaling.setAll(scale);
    }
    const traverse = (node) => {
        if (node.system) {
            batchRenderer.addSystem(node.system);
            systems.push(node.system);
            node.system.play();
            trackedSystems.push(node.system);
        }
        for (const child of node.getChildren()) {
            traverse(child);
        }
    };
    traverse(effect);
}

export async function initSubEmitterBabylonDemo({scene, camera, batchRenderer, systems, demoState}) {
    camera.setPosition(new BVector3(0, 8, 18));
    const trackedSystems = [];
    await loadEffectAndAttach({scene, batchRenderer, systems, path: 'AcidBoiling.json', positionX: -5, scale: 2, trackedSystems});
    await loadEffectAndAttach({scene, batchRenderer, systems, path: 'subEmitter2.json', positionX: 5, trackedSystems});
    demoState.subEmitter = {elapsed: 0, trackedSystems};
}

export function updateSubEmitterBabylonDemo({demoState}, delta) {
    const state = demoState.subEmitter;
    if (!state?.trackedSystems?.length) {
        return;
    }
    state.elapsed += delta;
    if (state.elapsed >= 2) {
        state.elapsed = 0;
        for (const system of state.trackedSystems) {
            system.restart();
            system.play();
        }
    }
}

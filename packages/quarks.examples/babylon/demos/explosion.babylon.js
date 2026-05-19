import {Vector3 as BVector3} from '@babylonjs/core/Maths/math.vector';
import {QuarksLoader} from 'babylon.quarks';

const EXPLOSION_REFRESH_TIME = 2;

export async function initExplosionBabylonDemo({scene, camera, batchRenderer, systems, demoState}) {
    camera.setPosition(new BVector3(0, 10, 15));

    const loader = new QuarksLoader(scene, {baseUrl: ''});
    const effect = await loader.load('ps.json');
    effect.parent = batchRenderer;
    const trackedSystems = [];
    const traverse = (node) => {
        if (node.system) {
            batchRenderer.addSystem(node.system);
            systems.push(node.system);
            trackedSystems.push(node.system);
            node.system.looping = false;
            node.system.restart();
            node.system.play();
        }
        for (const child of node.getChildren()) {
            traverse(child);
        }
    };
    traverse(effect);
    demoState.explosion = {elapsed: 0, systems: trackedSystems};
}

export function updateExplosionBabylonDemo({demoState}, delta) {
    const state = demoState.explosion;
    if (!state?.systems?.length) {
        return;
    }
    state.elapsed += delta;
    if (state.elapsed >= EXPLOSION_REFRESH_TIME) {
        state.elapsed = 0;
        for (const system of state.systems) {
            system.restart();
            system.play();
        }
    }
}

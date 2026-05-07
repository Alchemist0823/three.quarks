import {Vector3 as BVector3} from '@babylonjs/core/Maths/math.vector';
import {QuarksLoader} from 'babylon.quarks';

async function loadEffectAndAttach({scene, batchRenderer, systems, path}) {
    const loader = new QuarksLoader(scene, {baseUrl: ''});
    const effect = await loader.load(path);
    effect.parent = batchRenderer;
    const traverse = (node) => {
        if (node.system) {
            batchRenderer.addSystem(node.system);
            systems.push(node.system);
            node.system.looping = true;
            node.system.play();
        }
        for (const child of node.getChildren()) {
            traverse(child);
        }
    };
    traverse(effect);
}

export async function initSubEmitterBabylonDemo({scene, camera, batchRenderer, systems}) {
    camera.setPosition(new BVector3(0, 8, 18));
    await loadEffectAndAttach({scene, batchRenderer, systems, path: 'AcidBoiling.json'});
    await loadEffectAndAttach({scene, batchRenderer, systems, path: 'subEmitter2.json'});
}

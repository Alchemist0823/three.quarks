import {Vector3 as BVector3} from '@babylonjs/core/Maths/math.vector';
import {QuarksLoader} from 'babylon.quarks';

export async function initExplosionBabylonDemo({scene, camera, batchRenderer, systems}) {
    camera.setPosition(new BVector3(0, 10, 15));

    const loader = new QuarksLoader(scene, {baseUrl: ''});
    const effect = await loader.load('ps.json');
    effect.parent = batchRenderer;

    const traverse = (node) => {
        if (node.system) {
            batchRenderer.addSystem(node.system);
            systems.push(node.system);
            node.system.looping = true;
            node.system.restart();
            node.system.play();
        }
        for (const child of node.getChildren()) {
            traverse(child);
        }
    };
    traverse(effect);
}

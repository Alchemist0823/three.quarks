import {
    BatchedParticleRenderer,
    QuarksLoader,
} from 'three.quarks';
import {Demo} from './demo.js';

export class ExplosionDemo extends Demo {
    name = 'explosion (Unity Exported)';
    refreshTime = 2;
    initScene() {
        super.initScene();

        this.batchRenderer = new BatchedParticleRenderer();
        this.scene.add(this.batchRenderer);

        new QuarksLoader().load('ps.json', (obj) => {
            obj.traverse((child) => {
                if (child.type === 'ParticleEmitter') {
                    this.batchRenderer.addSystem(child.system);
                }
            });
            if (obj.type === 'ParticleEmitter') {
                this.batchRenderer.addSystem(obj.system);
            }
            this.scene.add(obj);
            this.groups.push(obj);
        });

        return this.scene;
    }
}

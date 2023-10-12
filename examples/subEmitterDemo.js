import {BatchedParticleRenderer, QuarksLoader} from 'three.quarks';
import {Demo} from './demo.js';

export class SubEmitterDemo extends Demo {
    name = 'Sub Emitter';
    //refreshTime = 0;
    initScene() {
        super.initScene();

        this.batchRenderer = new BatchedParticleRenderer();
        this.scene.add(this.batchRenderer);

        new QuarksLoader().load('AcidBoiling.json', (obj) => {
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

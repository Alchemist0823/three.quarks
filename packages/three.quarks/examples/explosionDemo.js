import {
    BatchedParticleRenderer,
    QuarksLoader,
    QuarksUtil,
} from 'three.quarks';
import {Demo} from './demo.js';

export class ExplosionDemo extends Demo {
    name = 'explosion (Unity Exported)';
    refreshTime = 2;
    initScene() {
        super.initScene();

        this.batchRenderer = new BatchedParticleRenderer();
        this.scene.add(this.batchRenderer);
        function listener(event) {
          console.log(event.type);
        }

        new QuarksLoader().load('ps.json', (obj) => {
            QuarksUtil.addToBatchRenderer(obj, this.batchRenderer);
            QuarksUtil.runOnAllParticleEmitters(obj, (emitter) => {
                emitter.system.addEventListener("emitEnd", listener);
            })
            this.scene.add(obj);
            this.groups.push(obj);
        });

        return this.scene;
    }
}

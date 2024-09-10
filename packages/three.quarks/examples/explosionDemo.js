import {
    BatchedParticleRenderer,
    QuarksLoader,
    QuarksUtil,
} from 'three.quarks';
import {Demo} from './demo.js';

export class ExplosionDemo extends Demo {
    name = 'explosion (Unity Exported)';
    refreshTime = 2;
    loadedEffect = null;

    newInstance() {
        function listener(event) {
            console.log(event.type);
        }
        const effect = this.loadedEffect.clone(true);
        QuarksUtil.runOnAllParticleEmitters(effect, (emitter) => {
            emitter.system.addEventListener("emitEnd", listener);
        })
        QuarksUtil.setAutoDestroy(effect, true);
        QuarksUtil.addToBatchRenderer(effect, this.batchRenderer);
        QuarksUtil.play(effect);
        this.scene.add(effect);
    }


    render(delta) {
        if (this.totalTime + delta > this.refreshTime) {
            this.newInstance();
        }
        super.render(delta);
    }

    initScene() {
        super.initScene();

        this.batchRenderer = new BatchedParticleRenderer();
        this.scene.add(this.batchRenderer);

        new QuarksLoader().load('ps.json', (obj) => {
            this.loadedEffect = obj;
            this.newInstance();
        });
        return this.scene;
    }
}

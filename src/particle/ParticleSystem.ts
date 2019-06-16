import {ConstantValue, ValueGenerator} from "./ValueGenerator";

export class ParticleEmitter {
    duration: number;
    maxParticle: number;
    startLife: ValueGenerator;
    emssion: ;

    constructor() {
        this.duration = 1;
        this.maxParticle = 1;
        this.startLife = new ConstantValue(1);
        this.emssion = 1;
    }

}
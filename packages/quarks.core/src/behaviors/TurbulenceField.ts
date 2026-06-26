import {Particle} from '../Particle';
import {Vector3} from '../math';
import SimplexNoise from '../util/SimplexNoise';
import {Behavior} from './Behavior';

/**
 * Apply turbulence to particles.
 */
export class TurbulenceField implements Behavior {
    readonly type = 'TurbulenceField';

    private readonly _tmpV = new Vector3();
    private readonly _tmpV2 = new Vector3();

    private readonly generator = new SimplexNoise();
    private readonly timeOffset = new Vector3();

    constructor(
        public scale: Vector3,
        public octaves: number,
        public velocityMultiplier: Vector3,
        public timeScale: Vector3
    ) {
        this.timeOffset.x = (Math.random() / scale.x) * timeScale.x;
        this.timeOffset.y = (Math.random() / scale.y) * timeScale.y;
        this.timeOffset.z = (Math.random() / scale.z) * timeScale.z;
    }

    initialize(particle: Particle): void {}

    update(particle: Particle, delta: number): void {
        const x = particle.position.x / this.scale.x;
        const y = particle.position.y / this.scale.y;
        const z = particle.position.z / this.scale.z;

        this._tmpV.set(0, 0, 0);
        let lvl = 1;

        for (let i = 0; i < this.octaves; i++) {
            const xLvl = x * lvl;
            const yLvl = y * lvl;
            const zLvl = z * lvl;

            this._tmpV2.set(
                this.generator.noise4D(xLvl, yLvl, zLvl, this.timeOffset.x * lvl) / lvl,
                this.generator.noise4D(xLvl, yLvl, zLvl, this.timeOffset.y * lvl) / lvl,
                this.generator.noise4D(xLvl, yLvl, zLvl, this.timeOffset.z * lvl) / lvl
            );

            this._tmpV.add(this._tmpV2);
            lvl *= 2;
        }

        this._tmpV.multiply(this.velocityMultiplier);
        particle.velocity.addScaledVector(this._tmpV, delta);
    }

    frameUpdate(delta: number): void {
        this.timeOffset.x += delta * this.timeScale.x;
        this.timeOffset.y += delta * this.timeScale.y;
        this.timeOffset.z += delta * this.timeScale.z;
    }

    toJSON(): any {
        return {
            type: this.type,
            scale: [this.scale.x, this.scale.y, this.scale.z],
            octaves: this.octaves,
            velocityMultiplier: [this.velocityMultiplier.x, this.velocityMultiplier.y, this.velocityMultiplier.z],
            timeScale: [this.timeScale.x, this.timeScale.y, this.timeScale.z],
        };
    }

    static fromJSON(json: any): Behavior {
        return new TurbulenceField(
            new Vector3(json.scale[0], json.scale[1], json.scale[2]),
            json.octaves,
            new Vector3(json.velocityMultiplier[0], json.velocityMultiplier[1], json.velocityMultiplier[2]),
            new Vector3(json.timeScale[0], json.timeScale[1], json.timeScale[2])
        );
    }

    clone(): Behavior {
        return new TurbulenceField(
            this.scale.clone(),
            this.octaves,
            this.velocityMultiplier.clone(),
            this.timeScale.clone()
        );
    }

    reset(): void {}
}

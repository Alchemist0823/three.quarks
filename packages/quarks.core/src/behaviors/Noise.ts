import {Particle} from '../Particle';
import {AnyValueGenerator, ConstantValue, ValueGeneratorFromJSON} from '../functions';
import {Quaternion, Vector3} from '../math';
import {randomInt} from '../util/MathUtil';
import SimplexNoise from '../util/SimplexNoise';
import {Behavior} from './Behavior';

const generators: SimplexNoise[] = [];
const _tmpV = new Vector3();
const _tmpQ = new Quaternion();

/**
 * Apply noise to particles.
 */
export class Noise implements Behavior {
    readonly type = 'Noise';

    duration = 0;

    constructor(
        public frequency: AnyValueGenerator,
        public power: AnyValueGenerator,
        public positionAmount: AnyValueGenerator = new ConstantValue(1),
        public rotationAmount: AnyValueGenerator = new ConstantValue(0)
    ) {
        if (generators.length === 0) {
            for (let i = 0; i < 100; i++) {
                generators.push(new SimplexNoise());
            }
        }
    }

    initialize(particle: Particle): void {
        const p = particle as any;
        p.lastPosNoise = new Vector3();
        p.generatorIndex = [randomInt(0, 100), randomInt(0, 100), randomInt(0, 100), randomInt(0, 100)];

        if (typeof particle.rotation === 'number') {
            p.lastRotNoise = 0;
        } else {
            p.lastRotNoise = new Quaternion();
        }

        this.positionAmount.startGen(particle.memory);
        this.rotationAmount.startGen(particle.memory);
        this.frequency.startGen(particle.memory);
        this.power.startGen(particle.memory);
    }

    update(particle: Particle, delta: number): void {
        const normalizedAge = particle.age / particle.life;
        const frequency = this.frequency.genValue(particle.memory, normalizedAge);
        const power = this.power.genValue(particle.memory, normalizedAge);
        const positionAmount = this.positionAmount.genValue(particle.memory, normalizedAge);
        const rotationAmount = this.rotationAmount.genValue(particle.memory, normalizedAge);

        const p = particle as any;
        const noiseFieldY = particle.age * frequency;

        if (positionAmount > 0 && p.lastPosNoise !== undefined) {
            const noiseFactor = power * positionAmount;

            _tmpV.set(
                generators[p.generatorIndex[0]].noise2D(0, noiseFieldY) * noiseFactor,
                generators[p.generatorIndex[1]].noise2D(0, noiseFieldY) * noiseFactor,
                generators[p.generatorIndex[2]].noise2D(0, noiseFieldY) * noiseFactor
            );

            particle.position.sub(p.lastPosNoise).add(_tmpV);
            p.lastPosNoise.copy(_tmpV);
        }

        if (rotationAmount > 0 && p.lastRotNoise !== undefined) {
            const noiseFactor = power * rotationAmount;

            if (typeof particle.rotation === 'number') {
                particle.rotation -= p.lastRotNoise;
                particle.rotation += generators[p.generatorIndex[3]].noise2D(0, noiseFieldY) * Math.PI * noiseFactor;

                return;
            } else {
                (p.lastRotNoise as Quaternion).invert();

                // Non-trail particles initialize rotation, the cast is safe
                (particle.rotation as Quaternion).multiply(p.lastRotNoise);

                _tmpQ
                    .set(
                        generators[p.generatorIndex[0]].noise2D(0, noiseFieldY) * noiseFactor,
                        generators[p.generatorIndex[1]].noise2D(0, noiseFieldY) * noiseFactor,
                        generators[p.generatorIndex[2]].noise2D(0, noiseFieldY) * noiseFactor,
                        generators[p.generatorIndex[3]].noise2D(0, noiseFieldY) * noiseFactor
                    )
                    .normalize();

                (particle.rotation as Quaternion).multiply(_tmpQ);
                p.lastRotNoise.copy(_tmpQ);
            }
        }
    }

    frameUpdate(delta: number): void {
        this.duration += delta;
    }

    toJSON(): any {
        return {
            type: this.type,
            frequency: this.frequency.toJSON(),
            power: this.power.toJSON(),
            positionAmount: this.positionAmount.toJSON(),
            rotationAmount: this.rotationAmount.toJSON(),
        };
    }

    static fromJSON(json: any): Behavior {
        return new Noise(
            ValueGeneratorFromJSON(json.frequency),
            ValueGeneratorFromJSON(json.power),
            ValueGeneratorFromJSON(json.positionAmount),
            ValueGeneratorFromJSON(json.rotationAmount)
        );
    }

    clone(): Behavior {
        return new Noise(
            this.frequency.clone(),
            this.power.clone(),
            this.positionAmount.clone(),
            this.rotationAmount.clone()
        );
    }

    reset(): void {}
}

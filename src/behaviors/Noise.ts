import {Behavior} from './Behavior';
import {Particle} from '../Particle';
import {Quaternion, Vector3} from 'three';
import SimplexNoise from '../util/SimplexNoise';
import {ConstantValue, FunctionValueGenerator, ValueGenerator, ValueGeneratorFromJSON} from '../functions';
import {randomInt} from '../util/MathUtil';

const generators: Array<SimplexNoise> = [];
const tempV = new Vector3();
const tempQ = new Quaternion();

export class Noise implements Behavior {
    type = 'Noise';
    duration = 0;

    constructor(
        public frequency: FunctionValueGenerator | ValueGenerator,
        public power: FunctionValueGenerator | ValueGenerator,
        public positionAmount: FunctionValueGenerator | ValueGenerator = new ConstantValue(1),
        public rotationAmount: FunctionValueGenerator | ValueGenerator = new ConstantValue(0)
    ) {
        if (generators.length === 0) {
            for (let i = 0; i < 100; i++) {
                generators.push(new SimplexNoise());
            }
        }
    }

    initialize(particle: Particle): void {
        (particle as any).lastPosNoise = new Vector3();
        if (typeof particle.rotation === 'number') {
            (particle as any).lastRotNoise = 0;
        } else {
            (particle as any).lastRotNoise = new Quaternion();
        }
        (particle as any).generatorIndex = [randomInt(0, 100), randomInt(0, 100), randomInt(0, 100), randomInt(0, 100)];
    }

    update(particle: Particle, _: number): void {
        let frequency = this.frequency.genValue(particle.age / particle.life);
        let power = this.power.genValue(particle.age / particle.life);
        let positionAmount = this.positionAmount.genValue(particle.age / particle.life);
        let rotationAmount = this.rotationAmount.genValue(particle.age / particle.life);
        if (positionAmount > 0 && (particle as any).lastPosNoise !== undefined) {
            console.log((particle as any).lastPosNoise);
            particle.position.sub((particle as any).lastPosNoise);
            tempV.set(
                generators[(particle as any).generatorIndex[0]].noise2D(0, particle.age * frequency) *
                    power *
                    positionAmount,
                generators[(particle as any).generatorIndex[1]].noise2D(0, particle.age * frequency) *
                    power *
                    positionAmount,
                generators[(particle as any).generatorIndex[2]].noise2D(0, particle.age * frequency) *
                    power *
                    positionAmount
            );
            particle.position.add(tempV);
            (particle as any).lastPosNoise.copy(tempV);
        }

        if (rotationAmount > 0 && (particle as any).lastRotNoise !== undefined) {
            if (typeof particle.rotation === 'number') {
                particle.rotation -= (particle as any).lastRotNoise;
                particle.rotation +=
                    generators[(particle as any).generatorIndex[3]].noise2D(0, particle.age * frequency) *
                    Math.PI *
                    power *
                    rotationAmount;
            } else {
                ((particle as any).lastRotNoise as Quaternion).invert();
                (particle.rotation as Quaternion).multiply((particle as any).lastRotNoise);
                tempQ
                    .set(
                        generators[(particle as any).generatorIndex[0]].noise2D(0, particle.age * frequency) *
                            power *
                            rotationAmount,
                        generators[(particle as any).generatorIndex[1]].noise2D(0, particle.age * frequency) *
                            power *
                            rotationAmount,
                        generators[(particle as any).generatorIndex[2]].noise2D(0, particle.age * frequency) *
                            power *
                            rotationAmount,
                        generators[(particle as any).generatorIndex[3]].noise2D(0, particle.age * frequency) *
                            power *
                            rotationAmount
                    )
                    .normalize();
                (particle.rotation as Quaternion).multiply(tempQ);
                (particle as any).lastRotNoise.copy(tempQ);
            }
        }
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

    frameUpdate(delta: number): void {
        this.duration += delta;
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

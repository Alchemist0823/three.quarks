import {
    ConstantValue,
    FunctionValueGenerator,
    GeneratorMemory,
    ValueGenerator,
    ValueGeneratorFromJSON,
} from '../functions';
import {EmissionState, IParticleSystem} from '../IParticleSystem';
import {Matrix4} from '../math';
import {Particle} from '../Particle';
import {
    EmitterMode,
    EmitterShape,
    getValueFromEmitterMode,
    setDefaultRotationFromMatrix,
    ShapeJSON,
} from './EmitterUtil';

/**
 * Interface representing the parameters for a rectangle emitter.
 */
export interface RectangleEmitterParameters {
    /**
     * The width of the rectangle.
     */
    width?: number;
    /**
     * The height of the rectangle.
     */
    height?: number;
    /**
     * The thickness of the ring.
     * 1 is a full rectangle, 0 is a ring with 0 radius.
     */
    thickness?: number;
    /**
     * The mode of the emitter.
     * {@link EmitterMode}
     */
    mode?: EmitterMode;
    /**
     * The length of segment of which emitter point converges at the start and end, when mode is EmitterMode.Loop or EmitterMode.PingPong.
     * {@link EmitterMode}
     */
    spread?: number;
    /**
     * The speed of the emitter start point travels when mode is EmitterMode.Loop or EmitterMode.PingPong.
     * {@link EmitterMode}
     */
    speed?: ValueGenerator | FunctionValueGenerator;
}

/**
 * a particle emitter that emits particles from a rectangle.
 */
export class RectangleEmitter implements EmitterShape {
    readonly type = 'rectangle';

    private currentValue = 0;
    private readonly _tmpM: Matrix4 = new Matrix4();

    width: number;
    height: number;
    thickness: number; // [0, 1]
    mode: EmitterMode;
    spread: number;
    speed: ValueGenerator | FunctionValueGenerator;
    memory: GeneratorMemory = [];

    constructor(parameters: RectangleEmitterParameters = {}) {
        this.width = parameters.width ?? 10;
        this.height = parameters.height ?? 10;
        this.thickness = parameters.thickness ?? 1;
        this.mode = parameters.mode ?? EmitterMode.Random;
        this.spread = parameters.spread ?? 0;
        this.speed = parameters.speed ?? new ConstantValue(1);
    }

    update(system: IParticleSystem, delta: number): void {
        this.currentValue += this.speed.genValue(this.memory, system.emissionState.time / system.duration) * delta;
    }

    initialize(p: Particle, emissionState: EmissionState) {
        const u = getValueFromEmitterMode(this.mode, this.currentValue, this.spread, emissionState);

        // Calculate perimeter points
        const totalPerimeter = 2 * (this.width + this.height);
        const point = u * totalPerimeter;

        // Map perimeter position to x,y coordinates
        let x, y;
        if (point < this.width) {
            // Bottom edge
            x = point - this.width / 2;
            y = -this.height / 2;
        } else if (point < this.width + this.height) {
            // Right edge
            x = this.width / 2;
            y = point - this.width - this.height / 2;
        } else if (point < 2 * this.width + this.height) {
            // Top edge
            x = this.width / 2 - (point - this.width - this.height);
            y = this.height / 2;
        } else {
            // Left edge
            x = -this.width / 2;
            y = this.height / 2 - (point - 2 * this.width - this.height);
        }

        // Apply thickness - lerp from edge point toward center
        const rand = Math.random();
        const thicknessScale = 1 - this.thickness * rand;
        p.position.x = x * thicknessScale;
        p.position.y = y * thicknessScale;
        p.position.z = 0;

        // Set velocity outward from center
        p.velocity.x = x;
        p.velocity.y = y;
        p.velocity.z = 0;
        p.velocity.normalize().multiplyScalar(p.startSpeed);

        setDefaultRotationFromMatrix(p.rotation, p.velocity, this._tmpM);
    }

    toJSON(): ShapeJSON {
        return {
            type: 'rectangle',
            width: this.width,
            height: this.height,
            thickness: this.thickness,
            mode: this.mode,
            spread: this.spread,
            speed: this.speed.toJSON(),
        };
    }

    static fromJSON(json: any): RectangleEmitter {
        return new RectangleEmitter({
            width: json.width,
            height: json.height,
            thickness: json.thickness,
            mode: json.mode,
            speed: json.speed ? ValueGeneratorFromJSON(json.speed) : undefined,
            spread: json.spread,
        });
    }

    clone(): EmitterShape {
        return new RectangleEmitter({
            width: this.width,
            height: this.height,
            thickness: this.thickness,
            mode: this.mode,
            speed: this.speed.clone(),
            spread: this.spread,
        });
    }
}

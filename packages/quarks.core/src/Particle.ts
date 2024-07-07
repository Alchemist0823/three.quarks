import {Matrix4, Quaternion, Vector3, Vector4} from './math';
import {EmissionState} from './IParticleSystem';
import {LinkedList} from './util/LinkedList';
import {GeneratorMemory} from './functions';

export interface IParticle {
    /**
     * Position of the particle.
     * @type {Vector3}
     */
    position: Vector3;
    /**
     * Velocity of the particle.
     * @type {Vector3}
     */
    velocity: Vector3;
    /**
     * Age of the particle.
     * @type {number}
     */
    age: number;
    /**
     * Life duration of the particle.
     * @type {number}
     */
    life: number;
    /**
     * Size of the particle.
     * @type {Vector3}
     */
    size: Vector3;
    /**
     * Rotation of the particle.
     * @type {number | Quaternion}
     */
    rotation?: number | Quaternion;
    /**
     * UV tile index.
     * @type {number}
     */
    uvTile: number;
    /**
     * Color of the particle.
     * @type {Vector4}
     */
    color: Vector4;
    /**
     * the memory of the particle.
     */
    memory: GeneratorMemory;
    /**
     * Indicates if the particle has died.
     * @type {boolean}
     */
    get died(): boolean;
}

export interface Particle extends IParticle {
    /**
     * Speed modifier of the particle.
     * @type {number}
     */
    speedModifier: number;
    /**
     * Emission state of the particle.
     * @type {EmissionState}
     */
    emissionState?: EmissionState;
    /**
     * Parent matrix for transformation.
     * @type {Matrix4}
     */
    parentMatrix?: Matrix4;
    /**
     * Initial speed of the particle.
     * @type {number}
     */
    startSpeed: number;
    /**
     * Initial color of the particle.
     * @type {Vector4}
     */
    startColor: Vector4;
    /**
     * Initial size of the particle.
     * @type {Vector3}
     */
    startSize: Vector3;

    reset(): void;
}

/**
 * Particle implementation for node-based particle systems.
 */
export class NodeParticle implements IParticle {
    /**
     * Position of the particle.
     * @type {Vector3}
     */
    position: Vector3 = new Vector3();
    /**
     * Velocity of the particle.
     * @type {Vector3}
     */
    velocity: Vector3 = new Vector3();
    /**
     * Age of the particle.
     * @type {number}
     */
    age = 0;
    /**
     * Life duration of the particle.
     * @type {number}
     */
    life = 1;
    /**
     * Size of the particle.
     * @type {Vector3}
     */
    size : Vector3 = new Vector3();
    /**
     * Angular velocity of the particle.
     * @type {number | Quaternion}
     */
    angularVelocity?: number | Quaternion;
    /**
     * Rotation of the particle.
     * @type {number | Quaternion}
     */
    rotation: number | Quaternion = 0;
    /**
     * Color of the particle.
     * @type {Vector4}
     */
    color: Vector4 = new Vector4(1, 1, 1, 1);
    /**
     * UV tile index.
     * @type {number}
     */
    uvTile = 0;

    /**
     * Indicates if the particle has died.
     * @type {boolean}
     */
    get died() {
        return this.age >= this.life;
    }

    /**
     * Resets the particle properties to initial values.
     */
    reset() {
        this.memory.length = 0;
        this.position.set(0, 0, 0);
        this.velocity.set(0, 0, 0);
        this.age = 0;
        this.life = 1;
        this.size.set(1, 1, 1);
        this.rotation = 0;
        this.color.set(1, 1, 1, 1);
        this.uvTile = 0;
    }

    memory = [];
}

/**
 * Particle implementation for sprite-based particle.
 */
export class SpriteParticle implements Particle {
    /**
     * Parent matrix for transformation.
     * @type {Matrix4}
     */
    parentMatrix?: Matrix4;
    /**
     * Initial speed of the particle.
     * @type {number}
     */
    startSpeed = 0;
    /**
     * Initial color of the particle.
     * @type {Vector4}
     */
    startColor: Vector4 = new Vector4();
    /**
     * Initial size of the particle.
     * @type {Vector3}
     */
    startSize: Vector3 = new Vector3(1, 1, 1);
    /**
     * Position of the particle.
     * @type {Vector3}
     */
    position: Vector3 = new Vector3();
    /**
     * Velocity of the particle.
     * @type {Vector3}
     */
    velocity: Vector3 = new Vector3();
    /**
     * Age of the particle.
     * @type {number}
     */
    age = 0;
    /**
     * Life duration of the particle.
     * @type {number}
     */
    life = 1;
    /**
     * Size of the particle.
     * @type {Vector3}
     */
    size = new Vector3(1, 1, 1);
    /**
     * Speed modifier of the particle.
     * @type {number}
     */
    speedModifier = 1;
    // extra properties
    /**
     * Angular velocity of the particle.
     * @type {number | Quaternion}
     */
    angularVelocity?: number | Quaternion;
    // GPU properties
    /**
     * Rotation of the particle.
     * @type {number | Quaternion}
     */
    rotation: number | Quaternion = 0;
    /**
     * Color of the particle.
     * @type {Vector4}
     */
    color: Vector4 = new Vector4();
    /**
     * UV tile index.
     * @type {number}
     */
    uvTile = 0;

    /**
     * Indicates if the particle has died.
     * @type {boolean}
     */
    get died() {
        return this.age >= this.life;
    }

    reset() {
        this.memory.length = 0;
    }

    memory = [];
}

export class RecordState {
    /**
     * Creates a new record state.
     * @param {Vector3} position - The position of the particle.
     * @param {number} size - The size of the particle.
     * @param {Vector4} color - The color of the particle.
     */
    constructor(
        public position: Vector3,
        public size: number,
        public color: Vector4
    ) {}
}

/**
 * Particle implementation for trail-based particles.
 */
export class TrailParticle implements Particle {
    /**
     * Parent matrix for transformation.
     * @type {Matrix4}
     */
    parentMatrix?: Matrix4;
    /**
     * Initial speed of the particle.
     * @type {number}
     */
    startSpeed = 0;
    /**
     * Initial color of the particle.
     * @type {Vector4}
     */
    startColor: Vector4 = new Vector4();
    /**
     * Initial size of the particle.
     * @type {Vector3}
     */
    startSize: Vector3 = new Vector3(1,1,1);
    /**
     * Position of the particle.
     * @type {Vector3}
     */
    position: Vector3 = new Vector3();
    /**
     * Local position of the particle.
     * @type {Vector3}
     */
    localPosition?: Vector3;
    /**
     * Velocity of the particle.
     * @type {Vector3}
     */
    velocity: Vector3 = new Vector3();
    /**
     * Age of the particle.
     * @type {number}
     */
    age = 0;
    /**
     * Life duration of the particle.
     * @type {number}
     */
    life = 1;
    /**
     * Size of the particle.
     * @type {Vector3}
     */
    size = new Vector3(1,1,1);
    /**
     * Length of the trail.
     * @type {number}
     */
    length = 100;
    /**
     * Speed modifier of the particle.
     * @type {number}
     */
    speedModifier = 1;

    // GPU properties
    /**
     * Color of the particle.
     * @type {Vector4}
     */
    color: Vector4 = new Vector4();
    /**
     * Previous states of the particle.
     * @type {LinkedList<RecordState>}
     */
    previous: LinkedList<RecordState> = new LinkedList<RecordState>();
    /**
     * UV tile index.
     * @type {number}
     */
    uvTile = 0;

    /**
     * Updates the particle state.
     */
    update() {
        if (this.age <= this.life) {
            this.previous.push(new RecordState(this.position.clone(), this.size.x, this.color.clone()));
        } else {
            if (this.previous.length > 0) {
                this.previous.dequeue();
            }
        }
        while (this.previous.length > this.length) {
            this.previous.dequeue();
        }
    }

    /**
     * Indicates if the particle has died.
     * @type {boolean}
     */
    get died() {
        return this.age >= this.life;
    }

    /**
     * Resets the particle properties and clears the previous states.
     */
    reset() {
        this.memory.length = 0;
        this.previous.clear();
    }

    memory = [];
}

import {Behavior} from "./Behavior";
import {Particle, SpriteParticle} from "../Particle";
import {FunctionValueGenerator, ValueGenerator} from "../functions/ValueGenerator";
import {Line, Line3, Plane, Quaternion, Vector2, Vector3} from "three";

const V3_Z = new Vector3(0, 0, 1);

export class OrbitOverLife implements Behavior {

    type = 'OrbitOverLife';
    rotation: Quaternion;
    line: Line3;
    temp = new Vector3();

    constructor(public orbitSpeed: FunctionValueGenerator | ValueGenerator, public axis: Vector3 = new Vector3(0, 1, 0)) {
        this.rotation = new Quaternion();
        this.line = new Line3();
    }

    initialize(particle: Particle): void {
    }

    update(particle: Particle, delta: number): void {
        this.line.set(new Vector3(0,0,0), this.axis);
        this.line.closestPointToPoint(particle.position, false, this.temp);
        this.rotation.setFromAxisAngle(this.axis, this.orbitSpeed.genValue(particle.age / particle.life) * delta);
        particle.position.sub(this.temp);
        particle.position.applyQuaternion(this.rotation);
        particle.position.add(this.temp);
    }
    toJSON(): any {
        return {
            type: this.type,
            orbitSpeed: this.orbitSpeed.toJSON(),
            axis: [this.axis.x, this.axis.y, this.axis.z],
        };
    }

    clone(): Behavior {
        return new OrbitOverLife(this.orbitSpeed.clone());
    }
}

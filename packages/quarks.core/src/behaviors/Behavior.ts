import {Particle} from '../Particle';
import {ColorOverLife} from './ColorOverLife';
import {RotationOverLife} from './RotationOverLife';
import {SizeOverLife} from './SizeOverLife';
import {SpeedOverLife} from './SpeedOverLife';
import {RotationBySpeed} from './RotationBySpeed';
import {SizeBySpeed} from './SizeBySpeed';
import {ColorBySpeed} from './ColorBySpeed';
import {FrameOverLife} from './FrameOverLife';
import {OrbitOverLife} from './OrbitOverLife';
import {ApplyForce} from './ApplyForce';
import {Constructable, ParameterPair} from '../TypeUtil';
import {GravityForce} from './GravityForce';
import {WidthOverLength} from './WidthOverLength';
import {ChangeEmitDirection} from './ChangeEmitDirection';
import {EmitSubParticleSystem} from './EmitSubParticleSystem';
import {IParticleSystem} from '../IParticleSystem';
import {TurbulenceField} from './TurbulenceField';
import {Rotation3DOverLife} from './Rotation3DOverLife';
import {ForceOverLife} from './ForceOverLife';
import {Noise} from './Noise';
import {LimitSpeedOverLife} from './LimitSpeedOverLife';
import { ApplyCollision } from './ApplyCollision';

/**
 * Interface for particle behaviors.
 * a behavior is a function that modifies a particle's properties over time.
 */
export interface Behavior {
    type: string;
    initialize(particle: Particle, particleSystem: IParticleSystem): void;
    update(particle: Particle, delta: number): void;
    frameUpdate(delta: number): void;
    toJSON(): any;
    clone(): Behavior;
    reset(): void;
}

export interface BehaviorPlugin {
    type: string;
    constructor: Constructable<Behavior>;
    params: ParameterPair[];
    loadJSON: (json: any, particleSystem: IParticleSystem) => Behavior;
}

export const BehaviorTypes: {[key: string]: BehaviorPlugin} = {
    ApplyForce: {
        type: 'ApplyForce',
        constructor: ApplyForce,
        params: [
            ['direction', ['vec3']],
            ['magnitude', ['value']],
        ],
        loadJSON: ApplyForce.fromJSON,
    },
    Noise: {
        type: 'Noise',
        constructor: Noise,
        params: [
            ['frequency', ['value']],
            ['power', ['value']],
            ['positionAmount', ['value']],
            ['rotationAmount', ['value']],
        ],
        loadJSON: Noise.fromJSON,
    },
    TurbulenceField: {
        type: 'TurbulenceField',
        constructor: TurbulenceField,
        params: [
            ['scale', ['vec3']],
            ['octaves', ['number']],
            ['velocityMultiplier', ['vec3']],
            ['timeScale', ['vec3']],
        ],
        loadJSON: TurbulenceField.fromJSON,
    },
    GravityForce: {
        type: 'GravityForce',
        constructor: GravityForce,
        params: [
            ['center', ['vec3']],
            ['magnitude', ['number']],
        ],
        loadJSON: GravityForce.fromJSON,
    },
    ColorOverLife: {
        type: 'ColorOverLife',
        constructor: ColorOverLife,
        params: [['color', ['colorFunc']]],
        loadJSON: ColorOverLife.fromJSON,
    },
    RotationOverLife: {
        type: 'RotationOverLife',
        constructor: RotationOverLife,
        params: [['angularVelocity', ['value', 'valueFunc']]],
        loadJSON: RotationOverLife.fromJSON,
    },
    Rotation3DOverLife: {
        type: 'Rotation3DOverLife',
        constructor: Rotation3DOverLife,
        params: [['angularVelocity', ['rotationFunc']]],
        loadJSON: Rotation3DOverLife.fromJSON,
    },
    SizeOverLife: {
        type: 'SizeOverLife',
        constructor: SizeOverLife,
        params: [['size', ['value', 'valueFunc', 'vec3Func']]],
        loadJSON: SizeOverLife.fromJSON,
    },
    ColorBySpeed: {
        type: 'ColorBySpeed',
        constructor: ColorBySpeed,
        params: [
            ['color', ['colorFunc']],
            ['speedRange', ['range']],
        ],
        loadJSON: ColorBySpeed.fromJSON,
    },
    RotationBySpeed: {
        type: 'RotationBySpeed',
        constructor: RotationBySpeed,
        params: [
            ['angularVelocity', ['value', 'valueFunc']],
            ['speedRange', ['range']],
        ],
        loadJSON: RotationBySpeed.fromJSON,
    },
    SizeBySpeed: {
        type: 'SizeBySpeed',
        constructor: SizeBySpeed,
        params: [
            ['size', ['value', 'valueFunc', 'vec3Func']],
            ['speedRange', ['range']],
        ],
        loadJSON: SizeBySpeed.fromJSON,
    },
    SpeedOverLife: {
        type: 'SpeedOverLife',
        constructor: SpeedOverLife,
        params: [['speed', ['value', 'valueFunc']]],
        loadJSON: SpeedOverLife.fromJSON,
    },
    FrameOverLife: {
        type: 'FrameOverLife',
        constructor: FrameOverLife,
        params: [['frame', ['value', 'valueFunc']]],
        loadJSON: FrameOverLife.fromJSON,
    },
    ForceOverLife: {
        type: 'ForceOverLife',
        constructor: ForceOverLife,
        params: [
            ['x', ['value', 'valueFunc']],
            ['y', ['value', 'valueFunc']],
            ['z', ['value', 'valueFunc']],
        ],
        loadJSON: ForceOverLife.fromJSON,
    },
    OrbitOverLife: {
        type: 'OrbitOverLife',
        constructor: OrbitOverLife,
        params: [
            ['orbitSpeed', ['value', 'valueFunc']],
            ['axis', ['vec3']],
        ],
        loadJSON: OrbitOverLife.fromJSON,
    },
    WidthOverLength: {
        type: 'WidthOverLength',
        constructor: WidthOverLength,
        params: [['width', ['value', 'valueFunc']]],
        loadJSON: WidthOverLength.fromJSON,
    },
    ChangeEmitDirection: {
        type: 'ChangeEmitDirection',
        constructor: ChangeEmitDirection,
        params: [['angle', ['value']]],
        loadJSON: ChangeEmitDirection.fromJSON,
    },
    EmitSubParticleSystem: {
        type: 'EmitSubParticleSystem',
        constructor: EmitSubParticleSystem,
        params: [
            ['particleSystem', ['self']],
            ['useVelocityAsBasis', ['boolean']],
            ['subParticleSystem', ['particleSystem']],
            ['mode', ['number']],
            ['emitProbability', ['number']],
        ],
        loadJSON: EmitSubParticleSystem.fromJSON,
    },
    LimitSpeedOverLife: {
        type: 'LimitSpeedOverLife',
        constructor: LimitSpeedOverLife,
        params: [
            ['speed', ['value', 'valueFunc']],
            ['dampen', ['number']],
        ],
        loadJSON: LimitSpeedOverLife.fromJSON,
    },
    /*ApplyCollision: {
        type: 'ApplyCollision',
        constructor: ApplyCollision,
        params: [
            ['resolver', ['']],
            ['bounce', ['number']],
        ],
        loadJSON: ApplyCollision.fromJSON,
    }*/
};

export function BehaviorFromJSON(json: any, particleSystem: IParticleSystem): Behavior | null {
    if (BehaviorTypes[json.type]) {
        return BehaviorTypes[json.type].loadJSON(json, particleSystem);
    }
    return null;
}


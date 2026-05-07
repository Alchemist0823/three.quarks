export {BatchedRenderer} from './BatchedRenderer';
export type {VFXBatchSettings} from './BatchedRenderer';
export {VFXBatch, RenderMode} from './VFXBatch';
export type {StoredBatchSettings} from './VFXBatch';
export {SpriteBatch} from './SpriteBatch';
export {TrailBatch} from './TrailBatch';
export {ParticleSystem} from './ParticleSystem';
export type {ParticleSystemParameters, BurstParameters} from './ParticleSystem';
export {ParticleEmitter} from './ParticleEmitter';
export {QuarksUtil} from './QuarksUtil';

// Re-export quarks.core runtime values (classes)
export {
    SpriteParticle,
    TrailParticle,
    // Behaviors (classes)
    BehaviorFromJSON,
    ApplyForce,
    GravityForce,
    ColorOverLife,
    RotationOverLife,
    Rotation3DOverLife,
    SizeOverLife,
    SpeedOverLife,
    FrameOverLife,
    ForceOverLife,
    OrbitOverLife,
    WidthOverLength,
    Noise,
    TurbulenceField,
    ColorBySpeed,
    SizeBySpeed,
    RotationBySpeed,
    LimitSpeedOverLife,
    EmitSubParticleSystem,
    // Shapes (classes)
    PointEmitter,
    SphereEmitter,
    HemisphereEmitter,
    ConeEmitter,
    CircleEmitter,
    DonutEmitter,
    GridEmitter,
    // Value generators (classes)
    ConstantValue,
    IntervalValue,
    PiecewiseBezier,
    Bezier,
    // Color generators (classes)
    ConstantColor,
    ColorRange,
    RandomColor,
    Gradient,
    RandomColorBetweenGradient,
    // Rotation generators (classes)
    AxisAngleGenerator,
    EulerGenerator,
    RandomQuatGenerator,
    // Math (classes)
    Vector2,
    Vector3,
    Vector4,
    Quaternion,
    Matrix3,
    Matrix4,
    MathUtils,
} from 'quarks.core';

// Re-export quarks.core types (interfaces - type-only)
export type {
    IParticleSystem,
    IParticle,
    Particle,
    EmissionState,
    RendererEmitterSettings,
    TrailSettings,
    StretchedBillBoardSettings,
    BillBoardSettings,
    MeshSettings,
    IEmitter,
    ParticleSystemEvent,
    ParticleSystemEventType,
    SerializationOptions,
    Behavior,
    EmitterShape,
    ValueGenerator,
    FunctionValueGenerator,
    ColorGenerator,
    FunctionColorGenerator,
    RotationGenerator,
    Vector3Generator,
} from 'quarks.core';

console.log(' Particle system powered by babylon.quarks. https://quarks.art/');

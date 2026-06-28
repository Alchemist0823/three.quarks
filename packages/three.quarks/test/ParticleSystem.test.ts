/**
 * @jest-environment jsdom
 */
import {
    ConstantValue,
    EmissionState,
    FunctionColorGenerator,
    FunctionValueGenerator,
    GeneratorMemory,
    Matrix4,
    ParticleSystem,
    RenderMode,
    SpriteParticle,
    StretchedBillBoardSettings,
    TrailSettings,
    Vector4,
} from '../src';
import {BufferGeometry, MeshBasicMaterial} from 'three';

class RecordingValueGenerator implements FunctionValueGenerator {
    readonly type = 'function';
    readonly times: number[] = [];

    constructor(private readonly value: number) {}

    startGen(memory: GeneratorMemory): void {}

    genValue(memory: GeneratorMemory, t: number): number {
        this.times.push(t);
        return this.value;
    }

    toJSON() {
        return {type: 'RecordingValueGenerator'};
    }

    clone(): FunctionValueGenerator {
        return new RecordingValueGenerator(this.value);
    }
}

class RecordingColorGenerator implements FunctionColorGenerator {
    readonly type = 'function';
    readonly times: number[] = [];

    startGen(memory: GeneratorMemory): void {}

    genColor(memory: GeneratorMemory, color: Vector4, t: number): Vector4 {
        this.times.push(t);
        return color.set(1, 1, 1, 1);
    }

    toJSON() {
        return {type: 'RecordingColorGenerator'};
    }

    clone(): FunctionColorGenerator {
        return new RecordingColorGenerator();
    }
}

function createEmissionState(time: number): EmissionState {
    return {
        isBursting: false,
        burstIndex: 0,
        burstWaveIndex: 0,
        burstParticleIndex: 0,
        burstParticleCount: 0,
        time,
        waitEmiting: 0,
        travelDistance: 0,
    };
}

describe('ParticleSystem', () => {
    test('constructor initializes stretched billboard renderer emitter settings', () => {
        const rendererEmitterSettings = {} as StretchedBillBoardSettings;
        const system = new ParticleSystem({
            material: new MeshBasicMaterial(),
            renderMode: RenderMode.StretchedBillBoard,
            rendererEmitterSettings,
            speedFactor: 3,
        });

        expect(system.rendererEmitterSettings).toBe(rendererEmitterSettings);
        expect(rendererEmitterSettings.speedFactor).toBe(3);
        expect(rendererEmitterSettings.lengthFactor).toBe(0);

        const existingSettings = {speedFactor: 2, lengthFactor: 4};
        const existingSettingsSystem = new ParticleSystem({
            material: new MeshBasicMaterial(),
            renderMode: RenderMode.StretchedBillBoard,
            rendererEmitterSettings: existingSettings,
        });

        expect(existingSettingsSystem.rendererEmitterSettings).toBe(existingSettings);
        expect(existingSettings.speedFactor).toBe(2);
        expect(existingSettings.lengthFactor).toBe(4);
    });

    test('renderMode applies mode defaults and marks renderer settings dirty', () => {
        const instancingGeometry = new BufferGeometry();
        const system = new ParticleSystem({
            material: new MeshBasicMaterial(),
            instancingGeometry,
        });

        system.neededToUpdateRender = false;
        system.renderMode = RenderMode.Mesh;
        expect(system.renderMode).toBe(RenderMode.Mesh);
        expect(system.rendererSettings.instancingGeometry).toBe(instancingGeometry);
        expect(system.startRotation.type).toBe('rotation');
        expect(system.neededToUpdateRender).toBe(true);

        system.neededToUpdateRender = false;
        system.renderMode = RenderMode.BillBoard;
        expect(system.renderMode).toBe(RenderMode.BillBoard);
        expect(system.rendererSettings.instancingGeometry).not.toBe(instancingGeometry);
        expect(system.rendererEmitterSettings).toEqual({});
        expect(system.startRotation.type).toBe('value');
        expect(system.neededToUpdateRender).toBe(true);
    });

    test('renderMode restarts active particles for trail transitions', () => {
        const system = new ParticleSystem({material: new MeshBasicMaterial()});

        system.particles.push(new SpriteParticle());
        system.particleNum = 1;
        system.paused = true;
        system.emissionState.time = 1;

        system.renderMode = RenderMode.HorizontalBillBoard;
        expect(system.particleNum).toBe(1);
        expect(system.particles).toHaveLength(1);
        expect(system.emissionState.time).toBe(1);

        system.renderMode = RenderMode.Trail;
        expect(system.particleNum).toBe(0);
        expect(system.particles).toHaveLength(0);
        expect(system.paused).toBe(false);
        expect(system.emissionState.time).toBe(0);
        expect((system.rendererEmitterSettings as TrailSettings).startLength.type).toBe('value');
    });

    test('restart clears distance emission state', () => {
        const system = new ParticleSystem({
            material: new MeshBasicMaterial(),
            emissionOverTime: new ConstantValue(0),
            emissionOverDistance: new ConstantValue(0.5),
        });
        const emitterMatrix = new Matrix4();

        system.emit(0, system.emissionState, emitterMatrix);
        emitterMatrix.elements[12] = 1;
        system.emit(0, system.emissionState, emitterMatrix);

        expect(system.emissionState.travelDistance).toBe(1);
        expect(system.emissionState.previousWorldPos).toBeDefined();

        system.restart();

        expect(system.emissionState.travelDistance).toBe(0);
        expect(system.emissionState.previousWorldPos).toBeUndefined();

        emitterMatrix.elements[12] = 3;
        system.emit(0, system.emissionState, emitterMatrix);

        expect(system.emissionState.waitEmiting).toBe(0);
        expect(system.emissionState.travelDistance).toBe(0);
    });

    test('emit uses the provided emission state time for sub-emission generators', () => {
        const burstCount = new RecordingValueGenerator(1);
        const startColor = new RecordingColorGenerator();
        const system = new ParticleSystem({
            material: new MeshBasicMaterial(),
            duration: 0.5,
            startColor,
            emissionOverTime: new ConstantValue(0),
            emissionOverDistance: new ConstantValue(0),
            emissionBursts: [
                {
                    time: 0.25,
                    count: burstCount,
                    cycle: 1,
                    interval: 0.1,
                    probability: 1,
                },
            ],
        });

        system.emissionState.time = 0.75;
        system.emit(0, createEmissionState(0.25), new Matrix4());

        expect(burstCount.times).toEqual([0.25]);
        expect(startColor.times).toEqual([0.5]);
    });
});

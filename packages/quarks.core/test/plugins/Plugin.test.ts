import {
    BehaviorTypes,
    EmitterShape,
    EmitterShapes,
    Plugin,
    Plugins,
    ShapeJSON,
    loadPlugin,
    unloadPlugin,
} from '../../src';

class TestEmitter implements EmitterShape {
    readonly type = 'test_emitter';

    initialize(): void {}

    toJSON(): ShapeJSON {
        return {type: this.type};
    }

    update(): void {}

    clone(): EmitterShape {
        return new TestEmitter();
    }
}

describe('Plugin', () => {
    const emitterShape = {
        type: 'test_emitter',
        constructor: TestEmitter,
        params: [],
        loadJSON: () => new TestEmitter(),
    };

    const plugin: Plugin = {
        id: 'test_plugin',
        initialize: jest.fn(),
        emitterShapes: [emitterShape],
        behaviors: [],
    };

    afterEach(() => {
        unloadPlugin(plugin.id);
        Plugins.delete(plugin.id);
        delete EmitterShapes[emitterShape.type];
    });

    test('registers a plugin once', () => {
        loadPlugin(plugin);
        loadPlugin(plugin);

        expect(Plugins.get(plugin.id)).toBe(plugin);
        expect(plugin.initialize).toHaveBeenCalledTimes(1);
        expect(EmitterShapes[emitterShape.type]).toBe(emitterShape);
    });

    test('unregisters plugin entries', () => {
        loadPlugin(plugin);
        unloadPlugin(plugin.id);

        expect(Plugins.has(plugin.id)).toBe(false);
        expect(EmitterShapes[emitterShape.type]).toBeUndefined();
    });

    test('does not remove entries it did not install', () => {
        const pointEmitter = EmitterShapes.point;
        const pointBehavior = BehaviorTypes.ColorOverLife;
        const conflictingPlugin: Plugin = {
            id: 'conflicting_plugin',
            initialize: jest.fn(),
            emitterShapes: [{...emitterShape, type: 'point'}],
            behaviors: [{...pointBehavior, type: 'ColorOverLife'}],
        };

        loadPlugin(conflictingPlugin);
        unloadPlugin(conflictingPlugin.id);

        expect(EmitterShapes.point).toBe(pointEmitter);
        expect(BehaviorTypes.ColorOverLife).toBe(pointBehavior);
    });
});

import {BehaviorPlugin, BehaviorTypes} from './behaviors';
import {EmitterShapePlugin, EmitterShapes} from './shape';

export interface Plugin {
    readonly id: string;
    initialize: () => void;
    emitterShapes: EmitterShapePlugin[];
    behaviors: BehaviorPlugin[];
}

export const Plugins: Map<string, Plugin> = new Map();

export function loadPlugin(plugin: Plugin) {
    const existing = Plugins.get(plugin.id);
    if (existing) return;

    Plugins.set(plugin.id, plugin);
    plugin.initialize();

    for (const emitterShape of plugin.emitterShapes) {
        EmitterShapes[emitterShape.type] ??= emitterShape;
    }

    for (const behavior of plugin.behaviors) {
        BehaviorTypes[behavior.type] ??= behavior;
    }
}

export function unloadPlugin(pluginId: string) {
    const plugin = Plugins.get(pluginId);
    if (!plugin) return;

    Plugins.delete(pluginId);

    for (const emitterShape of plugin.emitterShapes) {
        if (Object.is(EmitterShapes[emitterShape.type], emitterShape)) {
            delete EmitterShapes[emitterShape.type];
        }
    }

    for (const behavior of plugin.behaviors) {
        if (Object.is(BehaviorTypes[behavior.type], behavior)) {
            delete BehaviorTypes[behavior.type];
        }
    }
}

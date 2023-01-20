import {Behavior, BehaviorPlugin, BehaviorTypes} from "./behaviors";
import {Constructable} from "./TypeUtil";
import {EmitterShape, EmitterShapePlugin, EmitterShapes} from "./shape";

export interface Plugin {
    id: string;
    initialize: ()=>void;
    emitterShapes: Array<EmitterShapePlugin>;
    behaviors: Array<BehaviorPlugin>;
}

export const Plugins: Array<Plugin> = [];

export function loadPlugin(plugin: Plugin) {
    const existing = Plugins.find(item => item.id === plugin.id);
    if (!existing) {
        plugin.initialize();
        for (let emitterShape of plugin.emitterShapes) {
            if (!EmitterShapes[emitterShape.type]) {
                EmitterShapes[emitterShape.type] = emitterShape;
            }
        }
        for (let behavior of plugin.behaviors) {
            if (!BehaviorTypes[behavior.type]) {
                BehaviorTypes[behavior.type] = behavior;
            }
        }
    }
}

export function unloadPlugin(pluginId: string) {
    const plugin = Plugins.find(item => item.id === pluginId);
    if (plugin) {
        for (let emitterShape of plugin.emitterShapes) {
            if (EmitterShapes[emitterShape.type]) {
                delete EmitterShapes[emitterShape.type];
            }
        }
        for (let behavior of plugin.behaviors) {
            if (BehaviorTypes[behavior.type]) {
                delete BehaviorTypes[behavior.type];
            }
        }
    }
}

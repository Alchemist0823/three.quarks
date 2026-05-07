import {alphaTestShared} from '../demos/shared/alphaTest.shared.js';
import {initMuzzleFlashBabylonDemo} from './demos/muzzleFlash.babylon.js';
import {initExplosionBabylonDemo, updateExplosionBabylonDemo} from './demos/explosion.babylon.js';
import {initEmitterShapeBabylonDemo} from './demos/emitterShape.babylon.js';
import {initTrailBabylonDemo, updateTrailBabylonDemo} from './demos/trail.babylon.js';
import {initSequencerBabylonDemo} from './demos/sequencer.babylon.js';
import {initMeshMaterialBabylonDemo} from './demos/meshMaterial.babylon.js';
import {initSubEmitterBabylonDemo, updateSubEmitterBabylonDemo} from './demos/subEmitter.babylon.js';
import {initTurbulenceBabylonDemo} from './demos/turbulence.babylon.js';
import {initAlphaTestBabylonDemo} from './demos/alphaTest.babylon.js';
import {initCustomPluginBabylonDemo} from './demos/customPlugin.babylon.js';
import {initBillboardBabylonDemo} from './demos/billboard.babylon.js';
import {initSoftParticleBabylonDemo} from './demos/softParticle.babylon.js';
import {initCustomBlendingBabylonDemo} from './demos/customBlending.babylon.js';
import {initFollowObjectBabylonDemo, updateFollowObjectBabylonDemo} from './demos/followObject.babylon.js';

function updateMuzzleFlash(context, delta) {
    const {systems, demoState} = context;
    const refreshTime = 1;
    const systemsPerGroup = 6;
    const numGroups = Math.floor(systems.length / systemsPerGroup);
    while (Math.floor((demoState.totalTime / refreshTime) * numGroups) >= demoState.refreshIndex) {
        if (demoState.refreshIndex < numGroups) {
            for (let s = demoState.refreshIndex * systemsPerGroup; s < demoState.refreshIndex * systemsPerGroup + systemsPerGroup && s < systems.length; s++) {
                systems[s].restart();
                systems[s].play();
            }
        }
        demoState.refreshIndex++;
    }
    demoState.totalTime += delta;
    if (demoState.totalTime > refreshTime) {
        demoState.totalTime = 0;
        demoState.refreshIndex = 0;
    }
}

export const babylonDemos = [
    {name: 'Muzzle Flash Performance', key: 'MuzzleFlashDemo', file: 'babylon/demos/muzzleFlash.babylon.js', init: initMuzzleFlashBabylonDemo, onFrame: updateMuzzleFlash},
    {name: 'explosion (Unity Exported)', key: 'ExplosionDemo', file: 'babylon/demos/explosion.babylon.js', init: initExplosionBabylonDemo, onFrame: updateExplosionBabylonDemo},
    {name: 'Different Emitter Shapes', key: 'EmitterShapeDemo', file: 'babylon/demos/emitterShape.babylon.js', init: initEmitterShapeBabylonDemo},
    {name: 'Trail Renderer and Physics', key: 'TrailDemo', file: 'babylon/demos/trail.babylon.js', init: initTrailBabylonDemo, onFrame: updateTrailBabylonDemo},
    {name: 'Texture Sequencer', key: 'SequencerDemo', file: 'babylon/demos/sequencer.babylon.js', init: initSequencerBabylonDemo},
    {name: 'Mesh Standard Material with Environment Map', key: 'MeshMaterialDemo', file: 'babylon/demos/meshMaterial.babylon.js', init: initMeshMaterialBabylonDemo},
    {name: 'Sub Emitter', key: 'SubEmitterDemo', file: 'babylon/demos/subEmitter.babylon.js', init: initSubEmitterBabylonDemo, onFrame: updateSubEmitterBabylonDemo},
    {name: 'Noise', key: 'TurbulenceDemo', file: 'babylon/demos/turbulence.babylon.js', init: initTurbulenceBabylonDemo},
    {name: alphaTestShared.name, key: 'AlphaTestDemo', file: 'babylon/demos/alphaTest.babylon.js', init: initAlphaTestBabylonDemo},
    {name: 'Customized Plugin', key: 'CustomPluginDemo', file: 'babylon/demos/customPlugin.babylon.js', init: initCustomPluginBabylonDemo},
    {name: 'Horizon, Vertical & Stretched Billboard', key: 'BillboardDemo', file: 'babylon/demos/billboard.babylon.js', init: initBillboardBabylonDemo},
    {name: 'Soft Particle & Blend Tiles Demo', key: 'SoftParticleDemo', file: 'babylon/demos/softParticle.babylon.js', init: initSoftParticleBabylonDemo},
    {name: 'Custom Blending Function', key: 'CustomBlendingDemo', file: 'babylon/demos/customBlending.babylon.js', init: initCustomBlendingBabylonDemo},
    {name: 'Following Moving Objects', key: 'FollowObjectDemo', file: 'babylon/demos/followObject.babylon.js', init: initFollowObjectBabylonDemo, onFrame: updateFollowObjectBabylonDemo},
];

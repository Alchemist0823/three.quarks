import {alphaTestShared} from '../demos/shared/alphaTest.shared.js';
import {initMuzzleFlashBabylonDemo} from './demos/muzzleFlash.babylon.js';
import {initExplosionBabylonDemo} from './demos/explosion.babylon.js';
import {initEmitterShapeBabylonDemo} from './demos/emitterShape.babylon.js';
import {initTrailBabylonDemo} from './demos/trail.babylon.js';
import {initSequencerBabylonDemo} from './demos/sequencer.babylon.js';
import {initMeshMaterialBabylonDemo} from './demos/meshMaterial.babylon.js';
import {initSubEmitterBabylonDemo} from './demos/subEmitter.babylon.js';
import {initTurbulenceBabylonDemo} from './demos/turbulence.babylon.js';
import {initAlphaTestBabylonDemo} from './demos/alphaTest.babylon.js';
import {initCustomPluginBabylonDemo, updateCustomPluginBabylonDemo} from './demos/customPlugin.babylon.js';
import {initBillboardBabylonDemo} from './demos/billboard.babylon.js';
import {initSoftParticleBabylonDemo} from './demos/softParticle.babylon.js';
import {initCustomBlendingBabylonDemo} from './demos/customBlending.babylon.js';
import {initFollowObjectBabylonDemo, updateFollowObjectBabylonDemo} from './demos/followObject.babylon.js';

function updateMuzzleFlash(context, delta) {
    const {systems, demoState} = context;
    const refreshTime = 1;
    const numGroups = Math.floor(systems.length / 4);
    while (Math.floor((demoState.totalTime / refreshTime) * numGroups) >= demoState.refreshIndex) {
        if (demoState.refreshIndex < numGroups) {
            for (let s = demoState.refreshIndex * 4; s < demoState.refreshIndex * 4 + 4 && s < systems.length; s++) {
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
    {name: 'MuzzleFlash', key: 'MuzzleFlashDemo', file: 'babylon/demos/muzzleFlash.babylon.js', init: initMuzzleFlashBabylonDemo, onFrame: updateMuzzleFlash},
    {name: 'Explosion', key: 'ExplosionDemo', file: 'babylon/demos/explosion.babylon.js', init: initExplosionBabylonDemo},
    {name: 'EmitterShape', key: 'EmitterShapeDemo', file: 'babylon/demos/emitterShape.babylon.js', init: initEmitterShapeBabylonDemo},
    {name: 'Trail', key: 'TrailDemo', file: 'babylon/demos/trail.babylon.js', init: initTrailBabylonDemo},
    {name: 'Sequencer', key: 'SequencerDemo', file: 'babylon/demos/sequencer.babylon.js', init: initSequencerBabylonDemo},
    {name: 'MeshMaterial', key: 'MeshMaterialDemo', file: 'babylon/demos/meshMaterial.babylon.js', init: initMeshMaterialBabylonDemo},
    {name: 'SubEmitter', key: 'SubEmitterDemo', file: 'babylon/demos/subEmitter.babylon.js', init: initSubEmitterBabylonDemo},
    {name: 'Turbulence', key: 'TurbulenceDemo', file: 'babylon/demos/turbulence.babylon.js', init: initTurbulenceBabylonDemo},
    {name: alphaTestShared.name, key: 'AlphaTestDemo', file: 'babylon/demos/alphaTest.babylon.js', init: initAlphaTestBabylonDemo},
    {name: 'CustomPlugin', key: 'CustomPluginDemo', file: 'babylon/demos/customPlugin.babylon.js', init: initCustomPluginBabylonDemo, onFrame: updateCustomPluginBabylonDemo},
    {name: 'Billboard', key: 'BillboardDemo', file: 'babylon/demos/billboard.babylon.js', init: initBillboardBabylonDemo},
    {name: 'SoftParticle', key: 'SoftParticleDemo', file: 'babylon/demos/softParticle.babylon.js', init: initSoftParticleBabylonDemo},
    {name: 'CustomBlending', key: 'CustomBlendingDemo', file: 'babylon/demos/customBlending.babylon.js', init: initCustomBlendingBabylonDemo},
    {name: 'FollowObject', key: 'FollowObjectDemo', file: 'babylon/demos/followObject.babylon.js', init: initFollowObjectBabylonDemo, onFrame: updateFollowObjectBabylonDemo},
];

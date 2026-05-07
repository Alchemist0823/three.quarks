import {Vector3 as BVector3} from '@babylonjs/core/Maths/math.vector';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial';
import {Color3} from '@babylonjs/core/Maths/math.color';
import {Constants} from '@babylonjs/core/Engines/constants';
import {
    ParticleSystem,
    ConstantValue,
    IntervalValue,
    PointEmitter,
    RenderMode,
    ConstantColor,
    Vector4,
} from 'babylon.quarks';
import {createSharedTexture, SHARED_ASSETS} from '../shared/common.js';

export function initFollowObjectBabylonDemo({scene, camera, batchRenderer, systems, demoState}) {
    camera.setPosition(new BVector3(0, 8, 20));
    const texture = createSharedTexture(scene, SHARED_ASSETS.defaultParticle);

    const leader = MeshBuilder.CreateSphere('followLeader', {diameter: 0.6}, scene);
    const leaderMat = new StandardMaterial('followLeaderMat', scene);
    leaderMat.diffuseColor = new Color3(1, 0.6, 0.2);
    leader.material = leaderMat;

    const system = new ParticleSystem({
        scene,
        duration: 6,
        looping: true,
        startLife: new IntervalValue(1, 2),
        startSpeed: new IntervalValue(0.4, 1.2),
        startSize: new IntervalValue(0.2, 0.5),
        startColor: new ConstantColor(new Vector4(1, 0.8, 0.3, 1)),
        emissionOverTime: new ConstantValue(30),
        shape: new PointEmitter(),
        renderMode: RenderMode.BillBoard,
        texture,
        transparent: true,
        blendMode: Constants.ALPHA_ADD,
    });
    batchRenderer.addSystem(system);
    systems.push(system);

    demoState.followObject = {
        elapsed: 0,
        leader,
        emitter: system.emitter,
    };
}

export function updateFollowObjectBabylonDemo({demoState}, delta) {
    const state = demoState.followObject;
    if (!state) {
        return;
    }
    state.elapsed += delta;
    state.leader.position.x = Math.cos(state.elapsed * 0.7) * 6;
    state.leader.position.z = Math.sin(state.elapsed * 0.9) * 4;
    state.leader.position.y = 1.5 + Math.sin(state.elapsed * 1.5) * 1.5;
    state.emitter.position.copyFrom(state.leader.position);
}

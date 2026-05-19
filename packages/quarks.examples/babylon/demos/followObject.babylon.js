import {Vector3 as BVector3} from '@babylonjs/core/Maths/math.vector';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial';
import {Color3} from '@babylonjs/core/Maths/math.color';
import {Constants} from '@babylonjs/core/Engines/constants';
import {
    ParticleSystem,
    ConstantValue,
    IntervalValue,
    ConeEmitter,
    RenderMode,
    ConstantColor,
    Vector4,
    SpeedOverLife,
    PiecewiseBezier,
    Bezier,
} from 'babylon.quarks';
import {createSharedTexture, SHARED_ASSETS} from '../shared/common.js';

export function initFollowObjectBabylonDemo({scene, camera, batchRenderer, systems, demoState}) {
    camera.setPosition(new BVector3(0, 10, 60));
    camera.lowerRadiusLimit = 1;
    camera.upperRadiusLimit = 200;
    const texture = createSharedTexture(scene, SHARED_ASSETS.defaultParticle);

    const leader = MeshBuilder.CreateSphere('followLeader', {diameter: 0.6}, scene);
    const leaderMat = new StandardMaterial('followLeaderMat', scene);
    leaderMat.diffuseColor = new Color3(1, 0.6, 0.2);
    leader.material = leaderMat;

    const system = new ParticleSystem({
        scene,
        duration: 6,
        looping: true,
        startLife: new IntervalValue(2, 3),
        startSpeed: new ConstantValue(20),
        startSize: new IntervalValue(1, 2),
        startColor: new ConstantColor(new Vector4(1, 1, 1, 1)),
        worldSpace: false,
        emissionOverTime: new ConstantValue(10),
        shape: new ConeEmitter({radius: 0.1, angle: 0.1}),
        renderMode: RenderMode.BillBoard,
        texture,
        transparent: true,
        blendMode: Constants.ALPHA_ADD,
    });
    system.addBehavior(new SpeedOverLife(new PiecewiseBezier([[new Bezier(1, 0.75, 0.5, 0), 0]])));
    system.emitter.parent = leader;
    batchRenderer.addSystem(system);
    systems.push(system);

    demoState.followObject = {
        elapsed: 0,
        leader,
        camera,
    };
}

export function updateFollowObjectBabylonDemo({demoState}, delta) {
    const state = demoState.followObject;
    if (!state) {
        return;
    }
    state.elapsed += delta;
    const x = Math.sin(state.elapsed) * 50;
    const z = Math.cos(state.elapsed) * 50;
    state.leader.position.x = x;
    state.leader.position.y = 0;
    state.leader.position.z = z;
    state.camera.setPosition(new BVector3(x, 10, z + 10));
    state.camera.setTarget(new BVector3(x, 0, z));
}

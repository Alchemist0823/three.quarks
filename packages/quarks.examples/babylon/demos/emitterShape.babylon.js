import {Vector3 as BVector3} from '@babylonjs/core/Maths/math.vector';
import {Constants} from '@babylonjs/core/Engines/constants';
import {
    ParticleSystem,
    RenderMode,
    ConstantValue,
    IntervalValue,
    ConstantColor,
    PointEmitter,
    ConeEmitter,
    SphereEmitter,
    CircleEmitter,
    DonutEmitter,
    GridEmitter,
    HemisphereEmitter,
    SizeOverLife,
    ApplyForce,
    PiecewiseBezier,
    Bezier,
    RandomColor,
    Vector4,
    Vector3,
} from 'babylon.quarks';
import {createSharedTexture} from '../shared/common.js';

function createShapeSystem({scene, batchRenderer, systems, texture, shape, color, position}) {
    const ps = new ParticleSystem({
        scene,
        duration: 5,
        looping: true,
        startLife: new IntervalValue(1, 2),
        startSpeed: new IntervalValue(2, 5),
        startSize: new IntervalValue(0.2, 0.5),
        startColor: color,
        emissionOverTime: new ConstantValue(40),
        shape,
        renderMode: RenderMode.BillBoard,
        texture,
        transparent: true,
        blendMode: Constants.ALPHA_ADD,
        startTileIndex: new ConstantValue(0),
        uTileCount: 10,
        vTileCount: 10,
    });
    ps.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.8, 0.4, 0), 0]])));
    if (position) {
        ps.emitter.position = position;
    }
    batchRenderer.addSystem(ps);
    systems.push(ps);
}

export function initEmitterShapeBabylonDemo({scene, camera, batchRenderer, systems}) {
    camera.setPosition(new BVector3(0, 9, 20));
    const texture = createSharedTexture(scene);

    createShapeSystem({
        scene,
        batchRenderer,
        systems,
        texture,
        shape: new PointEmitter(),
        color: new RandomColor(new Vector4(1, 0.3, 0.1, 1), new Vector4(1, 0.8, 0.2, 1)),
        position: new BVector3(-8, 0, -2),
    });
    createShapeSystem({
        scene,
        batchRenderer,
        systems,
        texture,
        shape: new SphereEmitter({radius: 1}),
        color: new ConstantColor(new Vector4(0.2, 0.8, 1, 1)),
        position: new BVector3(-4, 0, 0),
    });
    createShapeSystem({
        scene,
        batchRenderer,
        systems,
        texture,
        shape: new HemisphereEmitter({radius: 1}),
        color: new ConstantColor(new Vector4(0.4, 1, 0.6, 1)),
        position: new BVector3(0, 0, 0),
    });
    createShapeSystem({
        scene,
        batchRenderer,
        systems,
        texture,
        shape: new ConeEmitter({angle: 0.5, radius: 0.5}),
        color: new ConstantColor(new Vector4(1, 0.8, 0.2, 1)),
        position: new BVector3(4, 0, 0),
    });
    createShapeSystem({
        scene,
        batchRenderer,
        systems,
        texture,
        shape: new CircleEmitter({radius: 1, arc: Math.PI * 2, thickness: 1}),
        color: new ConstantColor(new Vector4(1, 0.4, 0.9, 1)),
        position: new BVector3(8, 0, 0),
    });
    createShapeSystem({
        scene,
        batchRenderer,
        systems,
        texture,
        shape: new DonutEmitter({radius: 1, donutRadius: 0.3, arc: Math.PI * 2}),
        color: new ConstantColor(new Vector4(0.9, 0.8, 0.2, 1)),
        position: new BVector3(-6, 0, 4),
    });
    createShapeSystem({
        scene,
        batchRenderer,
        systems,
        texture,
        shape: new GridEmitter({width: 1.8, height: 1.8, column: 6, row: 6}),
        color: new ConstantColor(new Vector4(0.5, 0.9, 1, 1)),
        position: new BVector3(0, 0, 4),
    });

    // TODO: three version uses TextGeometry labels for each shape; Babylon fallback currently omits text labels.
    if (systems[0]) {
        systems[0].addBehavior(new ApplyForce(new Vector3(0, -1, 0), new ConstantValue(5)));
    }
}

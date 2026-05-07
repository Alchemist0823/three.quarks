import {Vector3 as BVector3} from '@babylonjs/core/Maths/math.vector';
import {Constants} from '@babylonjs/core/Engines/constants';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial';
import {DynamicTexture} from '@babylonjs/core/Materials/Textures/dynamicTexture';
import {Color3} from '@babylonjs/core/Maths/math.color';
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

function createLabel(scene, text, position) {
    const plane = MeshBuilder.CreatePlane(`label-${text}`, {size: 1.6}, scene);
    plane.position = position;
    const texture = new DynamicTexture(`label-tex-${text}`, {width: 256, height: 64}, scene, false);
    texture.drawText(text, 16, 44, 'bold 36px Arial', 'white', 'transparent', true);
    const material = new StandardMaterial(`label-mat-${text}`, scene);
    material.diffuseTexture = texture;
    material.emissiveColor = new Color3(1, 1, 1);
    material.opacityTexture = texture;
    material.backFaceCulling = false;
    plane.material = material;
}

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
    camera.setPosition(new BVector3(0, 0, 24));
    const texture = createSharedTexture(scene);

    createShapeSystem({
        scene,
        batchRenderer,
        systems,
        texture,
        shape: new PointEmitter(),
        color: new RandomColor(new Vector4(1, 0.3, 0.1, 1), new Vector4(1, 0.8, 0.2, 1)),
        position: new BVector3(-5, -5, 2),
    });
    createShapeSystem({
        scene,
        batchRenderer,
        systems,
        texture,
        shape: new SphereEmitter({radius: 1}),
        color: new ConstantColor(new Vector4(0.2, 0.8, 1, 1)),
        position: new BVector3(-5, 0, 2),
    });
    createShapeSystem({
        scene,
        batchRenderer,
        systems,
        texture,
        shape: new HemisphereEmitter({radius: 1}),
        color: new ConstantColor(new Vector4(0.4, 1, 0.6, 1)),
        position: new BVector3(-5, 5, 2),
    });
    createShapeSystem({
        scene,
        batchRenderer,
        systems,
        texture,
        shape: new ConeEmitter({angle: 0.5, radius: 0.5}),
        color: new ConstantColor(new Vector4(1, 0.8, 0.2, 1)),
        position: new BVector3(0, -5, 2),
    });
    createShapeSystem({
        scene,
        batchRenderer,
        systems,
        texture,
        shape: new CircleEmitter({radius: 1, arc: Math.PI * 2, thickness: 1}),
        color: new ConstantColor(new Vector4(1, 0.4, 0.9, 1)),
        position: new BVector3(0, 0, 2),
    });
    createShapeSystem({
        scene,
        batchRenderer,
        systems,
        texture,
        shape: new DonutEmitter({radius: 2, donutRadius: 0.2, arc: Math.PI * 2}),
        color: new ConstantColor(new Vector4(0.9, 0.8, 0.2, 1)),
        position: new BVector3(0, 5, 2),
    });
    createShapeSystem({
        scene,
        batchRenderer,
        systems,
        texture,
        shape: new GridEmitter({width: 2, height: 2, column: 10, row: 10}),
        color: new ConstantColor(new Vector4(0.5, 0.9, 1, 1)),
        position: new BVector3(5, 0, 2),
    });

    systems[2].emitter.rotation.x = -Math.PI / 2;

    createLabel(scene, 'Point', new BVector3(-5, -7, 2));
    createLabel(scene, 'Sphere', new BVector3(-5, -2, 2));
    createLabel(scene, 'Hemisphere', new BVector3(-5, 3, 2));
    createLabel(scene, 'Cone', new BVector3(0, -7, 2));
    createLabel(scene, 'Circle', new BVector3(0, -2, 2));
    createLabel(scene, 'Donut', new BVector3(0, 3, 2));
    createLabel(scene, 'Grid', new BVector3(5, -2, 2));

    if (systems[0]) {
        systems[0].addBehavior(new ApplyForce(new Vector3(0, -1, 0), new ConstantValue(5)));
    }
}

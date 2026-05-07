import {Vector3 as BVector3} from '@babylonjs/core/Maths/math.vector';
import {Texture} from '@babylonjs/core/Materials/Textures/texture';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder';
import {
    ParticleSystem,
    RenderMode,
    ConstantValue,
    IntervalValue,
    ConstantColor,
    PointEmitter,
    PiecewiseBezier,
    Bezier,
    Vector4,
    Vector3,
    AxisAngleGenerator,
    Rotation3DOverLife,
    SpeedOverLife,
} from 'babylon.quarks';
import {alphaTestShared} from '../../demos/shared/alphaTest.shared.js';

export function initAlphaTestBabylonDemo({scene, camera, batchRenderer, systems}) {
    camera.setPosition(new BVector3(0, 7, 14));

    const diffuseTexture = new Texture('textures/texture1.png', scene);
    diffuseTexture.hasAlpha = true;

    const leafMaterial = new StandardMaterial('alphaTestLeafMaterial', scene);
    leafMaterial.diffuseTexture = diffuseTexture;
    leafMaterial.opacityTexture = diffuseTexture;
    leafMaterial.backFaceCulling = false;
    leafMaterial.alphaCutOff = 0.5;

    const leafMesh = MeshBuilder.CreatePlane('alphaTestLeafMesh', {size: 0.8}, scene);
    leafMesh.material = leafMaterial;
    leafMesh.isVisible = false;

    const leaves = new ParticleSystem({
        scene,
        duration: alphaTestShared.duration,
        looping: true,
        instancingGeometry: leafMesh,
        startLife: new IntervalValue(alphaTestShared.life.min, alphaTestShared.life.max),
        startSpeed: new ConstantValue(alphaTestShared.speed),
        startSize: new IntervalValue(alphaTestShared.size.min, alphaTestShared.size.max),
        startColor: new ConstantColor(new Vector4(1, 1, 1, 1)),
        worldSpace: false,
        maxParticle: alphaTestShared.burstCount,
        emissionOverTime: new ConstantValue(0),
        emissionBursts: [
            {
                time: 0,
                count: new ConstantValue(alphaTestShared.burstCount),
                cycle: 1,
                interval: 0.01,
                probability: 1,
            },
        ],
        shape: new PointEmitter(),
        material: leafMaterial,
        startTileIndex: new ConstantValue(0),
        uTileCount: 1,
        vTileCount: 1,
        renderMode: RenderMode.Mesh,
    });
    leaves.addBehavior(
        new Rotation3DOverLife(
            new AxisAngleGenerator(
                new Vector3(
                    alphaTestShared.angularVelocityAxis.x,
                    alphaTestShared.angularVelocityAxis.y,
                    alphaTestShared.angularVelocityAxis.z
                ).normalize(),
                new ConstantValue(alphaTestShared.angularVelocity)
            ),
            false
        )
    );
    leaves.addBehavior(
        new SpeedOverLife(
            new PiecewiseBezier([
                [new Bezier(...alphaTestShared.speedOverLifeCurve), 0],
            ])
        )
    );
    leaves.emitter.position = new BVector3(alphaTestShared.emitterOffsetX, 0, 0);

    batchRenderer.addSystem(leaves);
    systems.push(leaves);
}

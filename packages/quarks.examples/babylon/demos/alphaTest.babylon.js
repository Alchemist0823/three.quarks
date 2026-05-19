import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader';
import '@babylonjs/loaders';
import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {VertexBuffer} from '@babylonjs/core/Buffers/buffer';
import {Texture} from '@babylonjs/core/Materials/Textures/texture';
import {Vector3 as BVector3} from '@babylonjs/core/Maths/math.vector';
import {Constants} from '@babylonjs/core/Engines/constants';
import {
    ParticleSystem,
    RenderMode,
    ConstantValue,
    IntervalValue,
    ConstantColor,
    PointEmitter,
    RandomQuatGenerator,
    PiecewiseBezier,
    Bezier,
    Vector4,
    Vector3,
    AxisAngleGenerator,
    Rotation3DOverLife,
    SpeedOverLife,
} from 'babylon.quarks';
import {alphaTestShared} from '../../demos/shared/alphaTest.shared.js';

function getMeshTexture(mesh) {
    const material = mesh.material;
    if (!material) {
        return null;
    }
    const candidate = material.albedoTexture || material.baseTexture || material.diffuseTexture || material.opacityTexture;
    return candidate instanceof Texture ? candidate : null;
}

export async function initAlphaTestBabylonDemo({scene, camera, batchRenderer, systems}) {
    camera.setPosition(new BVector3(0, 7, 14));

    const loaded = await SceneLoader.ImportMeshAsync('', '', 'leave.glb', scene);
    const sourceMesh = loaded.meshes.find((node) => node instanceof Mesh && node.getTotalVertices() > 0);
    if (!(sourceMesh instanceof Mesh)) {
        return;
    }
    sourceMesh.isVisible = false;
    sourceMesh.setEnabled(false);

    const positions = sourceMesh.getVerticesData(VertexBuffer.PositionKind);
    const uvs = sourceMesh.getVerticesData(VertexBuffer.UVKind);
    const normals = sourceMesh.getVerticesData(VertexBuffer.NormalKind);
    const indices = sourceMesh.getIndices();
    if (!positions || !indices) {
        return;
    }

    const diffuseTexture = getMeshTexture(sourceMesh);
    const leaves = new ParticleSystem({
        scene,
        duration: alphaTestShared.duration,
        looping: true,
        instancingGeometry: new Float32Array(positions),
        instancingUVs: uvs ? new Float32Array(uvs) : undefined,
        instancingNormals: normals ? new Float32Array(normals) : undefined,
        instancingIndices: new Uint32Array(indices),
        startRotation: new RandomQuatGenerator(),
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
        texture: diffuseTexture,
        alphaTest: 0.5,
        transparent: false,
        blendMode: Constants.ALPHA_COMBINE,
        depthWrite: true,
        depthTest: true,
        startTileIndex: new ConstantValue(0),
        uTileCount: 1,
        vTileCount: 1,
        renderOrder: 2,
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

import {Vector3 as BVector3} from '@babylonjs/core/Maths/math.vector';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial';
import {CubeTexture} from '@babylonjs/core/Materials/Textures/cubeTexture';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder';
import {VertexBuffer} from '@babylonjs/core/Buffers/buffer';
import {Constants} from '@babylonjs/core/Engines/constants';
import {
    ParticleSystem,
    ConstantValue,
    IntervalValue,
    PointEmitter,
    RenderMode,
    ConstantColor,
    AxisAngleGenerator,
    Rotation3DOverLife,
    Vector4,
    Vector3,
} from 'babylon.quarks';

export function initMeshMaterialBabylonDemo({scene, camera, batchRenderer, systems}) {
    camera.setPosition(new BVector3(0, 6, 16));

    const meshMaterial = new StandardMaterial('meshParticleMaterial', scene);
    meshMaterial.backFaceCulling = false;
    meshMaterial.alpha = 0.95;
    meshMaterial.reflectionTexture = new CubeTexture('textures/cube/', scene, [
        'posx.jpg',
        'posy.jpg',
        'posz.jpg',
        'negx.jpg',
        'negy.jpg',
        'negz.jpg',
    ]);

    const particleMesh = MeshBuilder.CreateCapsule('meshParticleGeo', {radius: 1, height: 3, tessellation: 12, subdivisions: 3}, scene);
    particleMesh.material = meshMaterial;
    particleMesh.isVisible = false;
    const positions = particleMesh.getVerticesData(VertexBuffer.PositionKind);
    const normals = particleMesh.getVerticesData(VertexBuffer.NormalKind);
    const indices = particleMesh.getIndices();
    if (!positions || !indices) {
        return;
    }

    const meshSystem = new ParticleSystem({
        scene,
        duration: 1,
        looping: true,
        prewarm: true,
        instancingGeometry: new Float32Array(positions),
        instancingNormals: normals ? new Float32Array(normals) : undefined,
        instancingIndices: new Uint32Array(indices),
        startLife: new IntervalValue(2.0, 3.0),
        startSpeed: new ConstantValue(1),
        startSize: new ConstantValue(0.1),
        startColor: new ConstantColor(new Vector4(1, 1, 1, 1)),
        worldSpace: true,
        emissionOverTime: new ConstantValue(60),
        shape: new PointEmitter(),
        material: meshMaterial,
        renderMode: RenderMode.Mesh,
        transparent: true,
        blendMode: Constants.ALPHA_COMBINE,
    });
    meshSystem.addBehavior(new Rotation3DOverLife(new AxisAngleGenerator(new Vector3(0.4, 1, 0.2), new ConstantValue(1.2)), false));
    batchRenderer.addSystem(meshSystem);
    systems.push(meshSystem);
}

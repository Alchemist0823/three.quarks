import {Vector3 as BVector3} from '@babylonjs/core/Maths/math.vector';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial';
import {CubeTexture} from '@babylonjs/core/Materials/Textures/cubeTexture';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder';
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

    const particleMesh = MeshBuilder.CreateBox('meshParticleGeo', {size: 0.35}, scene);
    particleMesh.material = meshMaterial;
    particleMesh.isVisible = false;

    const meshSystem = new ParticleSystem({
        scene,
        duration: 5,
        looping: true,
        instancingGeometry: particleMesh,
        startLife: new IntervalValue(1.5, 2.5),
        startSpeed: new IntervalValue(0.4, 1.2),
        startSize: new IntervalValue(0.4, 0.8),
        startColor: new ConstantColor(new Vector4(1, 1, 1, 1)),
        emissionOverTime: new ConstantValue(30),
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

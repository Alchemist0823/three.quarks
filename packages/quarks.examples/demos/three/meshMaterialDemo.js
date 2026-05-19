import {
    Group,
    MeshStandardMaterial,
    BoxGeometry,
    Vector4,
    Color,
    CubeTextureLoader,
    SphereGeometry,
    Mesh,
    CapsuleGeometry,
} from 'three';
import {
    BatchedParticleRenderer,
    RandomQuatGenerator,
    ParticleSystem,
    ConeEmitter,
    ConstantValue,
    ConstantColor,
    RenderMode,
    IntervalValue,
    EulerGenerator,
    Rotation3DOverLife
} from 'three.quarks';
import {Demo} from './demo.js';

export class MeshMaterialDemo extends Demo {
    name = 'Mesh Standard Material with Environment Map';
    initScene() {
        super.initScene();

        this.batchRenderer = new BatchedParticleRenderer();
        this.scene.add(this.batchRenderer);

        const loader = new CubeTextureLoader();
        loader.setPath( 'textures/cube/' );
        let  textureCube = loader.load( [ 'posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg' ] );

        const geo = new CapsuleGeometry(1.0, 3.0);
        const mat = new MeshStandardMaterial({
            color: new Color(0.5, 0.5, 0.5),
            roughness: 0.2,
            metalness: 1.0,
            envMap: textureCube,
            envMapIntensity: 1.0,
        });

        let ps = new ParticleSystem({
            duration: 1,
            looping: true,
            prewarm: true,
            instancingGeometry: geo,
            startLife: new IntervalValue(2.0, 3.0),
            startSpeed: new ConstantValue(1),
            startSize: new ConstantValue(0.1),
            startColor: new ConstantColor(new Vector4(1, 1, 1, 1)),
            startRotation: new RandomQuatGenerator(),
            worldSpace: true,

            emissionOverTime: new ConstantValue(60),
            emissionBursts: [],

            shape: new ConeEmitter({radius: 0.1, angle: 1}),
            material: mat,
            renderMode: RenderMode.Mesh,
            startTileIndex: new ConstantValue(0),
            uTileCount: 10,
            vTileCount: 10,
            renderOrder: 0,
        });
        ps.addBehavior(new Rotation3DOverLife(new EulerGenerator(new IntervalValue(0, Math.PI), new ConstantValue(0), new ConstantValue(0))));
        this.batchRenderer.addSystem(ps);
        this.scene.add(ps.emitter);

        return this.scene;
    }
}

import * as React from "react";
import Stats from "stats.js";
import {WEBGL} from "../WebGL";
import {
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
    Clock,
    PointLight,
    Color,
    SphereBufferGeometry,
    Mesh,
    MeshStandardMaterial, AmbientLight, Vector4, TextureLoader, AdditiveBlending
} from "three";
import {ParticleSystem} from "../particle/ParticleSystem";
import {RefObject} from "react";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {ConstantValue} from "../particle/ValueGenerator";

interface ThreejsViewportProps {
    width: number;
    height: number;
}

export class ThreejsViewport extends React.Component<ThreejsViewportProps> {
    container: RefObject<HTMLDivElement>;
    stats?: Stats;
    camera?: PerspectiveCamera;
    scene?: Scene;
    renderer?: WebGLRenderer;
    private particleSystem?: ParticleSystem;
    private clock?: Clock;
    private controls?: OrbitControls;

    constructor(props: Readonly<ThreejsViewportProps>) {
        super(props);
        this.container = React.createRef();
    }

    componentDidMount(): void {
        if ( this.init() ) {
            this.animate();
        }
    }

    componentDidUpdate(prevProps: Readonly<ThreejsViewportProps>, prevState: Readonly<{}>, snapshot?: any): void {
        this.camera!.aspect = this.props.width / this.props.height;
        this.camera!.updateProjectionMatrix();

        this.renderer!.setSize( this.props.width, this.props.height );
    }

    init() {

        if ( WEBGL.isWebGLAvailable() === false ) {
            document.body.appendChild( WEBGL.getWebGLErrorMessage() );
            return false;
        }

        this.renderer = new WebGLRenderer();

        if ( this.renderer.extensions.get( 'ANGLE_instanced_arrays' ) === null ) {

            document.getElementById( 'notSupported' )!.style.display = '';
            return false;

        }

        let width = this.props.width;
        let height = this.props.height;

        this.clock = new Clock();
        this.scene = new Scene();

        this.camera = new PerspectiveCamera( 50, width / height, 1, 1000 );
        this.camera.position.set(100, 100, 100);

        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;
        this.controls.rotateSpeed = 0.2;
        this.controls.update();

        let texture = new TextureLoader().load( "textures/texture1.png" , ()=>{console.log("load")}, ()=>{console.log("progress")}, (e)=>{console.info(e)});

        this.particleSystem = new ParticleSystem({
            maxParticle: 100,
            emissionOverTime: new ConstantValue(10),
            startLife: new ConstantValue(10),
            startSpeed: new ConstantValue(0),
            startSize: new ConstantValue(1),
            startColor: new Vector4(1,1,1, 1),
            texture: texture,
            blending: AdditiveBlending,
            startTileIndex: 0,
            uTileCount: 10,
            vTileCount: 10,
            worldSpace: true
        });
        //this.particleSystem.renderer.position.set(10, 0, 0);
        this.scene.add(this.particleSystem.renderer);

        const light = new PointLight(new Color(1,1,1), 0.8, 200);
        light.position.set(20, 20, 20);
        this.scene.add(light);

        const ambientLight = new AmbientLight(new Color(1, 1, 1), 0.2);
        this.scene.add(ambientLight);

        //const mesh = new Mesh(new SphereBufferGeometry(10, 32, 16), new MeshStandardMaterial({color: 0xDD6644}));
        //this.scene.add(mesh);

        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( width, height );
        this.container.current!.appendChild( this.renderer.domElement );

        this.stats = new Stats();
        this.stats.dom.style.position = "absolute";
        this.stats.dom.style.left = "";
        this.stats.dom.style.right = "0";
        this.container.current!.appendChild( this.stats.dom );

        //window.addEventListener( 'resize', this.onWindowResize, false );

        return true;

    }

    onWindowResize = ( event: any ) => {
        this.camera!.aspect = window.innerWidth / window.innerHeight;
        this.camera!.updateProjectionMatrix();

        this.renderer!.setSize( window.innerWidth, window.innerHeight );
    };

    animate = () => {
        requestAnimationFrame( this.animate );

        this.renderScene();
        this.stats!.update();
    };

    renderScene() {
        this.controls!.update();
        //let time = performance.now() * 0.0005;
        this.particleSystem!.update(this.clock!.getDelta());

        this.particleSystem!.renderer.position.set(Math.cos(this.clock!.getElapsedTime()) * 20, 0, Math.sin(this.clock!.getElapsedTime()) * 20);
        //console.log(this.particleSystem!.renderer.modelViewMatrix);

        this.renderer!.render( this.scene!, this.camera! );
    }

    render() {
        return <div ref={this.container}> </div>;
    }
}
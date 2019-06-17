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
    MeshStandardMaterial, AmbientLight, Vector4, TextureLoader, AdditiveBlending, AxesHelper
} from "three";
import {ParticleSystem} from "../particle/ParticleSystem";
import {RefObject} from "react";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {ConeEmitter} from "../particle/shape/ConeEmitter";
import {ConstantColor} from "../particle/functions/ColorGenerator";
import {ToonProjectile} from "../example/ToonProjectile";
import {ConstantValue} from "../particle/functions/ConstantValue";

interface ThreejsViewportProps {
    width: number;
    height: number;
    scene: Scene;
    renderCallback: (delta:number)=>void;
}

export class ThreejsViewport extends React.Component<ThreejsViewportProps> {
    container: RefObject<HTMLDivElement>;
    stats?: Stats;
    camera?: PerspectiveCamera;
    renderer?: WebGLRenderer;
    private particleSystem?: ParticleSystem;
    private clock?: Clock;
    private controls?: OrbitControls;
    private toonProjectile?: ToonProjectile;

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
        const scene = this.props.scene;

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

        this.camera = new PerspectiveCamera( 50, width / height, 1, 1000 );
        this.camera.position.set(50, 50, 50);

        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;
        this.controls.rotateSpeed = 0.2;
        this.controls.update();

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
        let delta = this.clock!.getDelta();
        //let time = performance.now() * 0.0005;
        //this.particleSystem!.update(this.clock!.getDelta());
        this.props.renderCallback(delta);
        //this.particleSystem!.emitter.rotation.y = this.clock!.getElapsedTime();
        //this.particleSystem!.emitter.position.set(Math.cos(this.clock!.getElapsedTime()) * 20, 0, Math.sin(this.clock!.getElapsedTime()) * 20);
        //console.log(this.particleSystem!.emitter.modelViewMatrix);

        this.renderer!.render( this.props.scene, this.camera! );
    }

    render() {
        return <div ref={this.container}> </div>;
    }
}

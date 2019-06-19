import * as React from "react";
import * as THREE from "three";
import {Object3D} from "three";
import {ParticleEmitter} from "../particle/ParticleEmitter";
import {Application} from "./Application";
import {TextureLoader} from "three";
import {ParticleSystem} from "../particle/ParticleSystem";
import {ConeEmitter} from "../particle/shape/ConeEmitter";
import {ConstantValue} from "../particle/functions/ConstantValue";
import {ConstantColor} from "../particle/functions/ColorGenerator";
import {Vector4} from "three";
import {AdditiveBlending} from "three";
import {Mesh} from "three";
import {BoxBufferGeometry} from "three";
import {MeshStandardMaterial} from "three";
import {ToonProjectile} from "../example/ToonProjectile";
import {Color} from "three";
import {AxesHelper} from "three";
import {PointLight} from "three";
import {AmbientLight} from "three";


interface ApplicationContextProps {

}

export interface AppContext {
    scene: THREE.Scene;
    script: (delta: number) => void;
    selection: Array<Object3D>;
    actions: {
        select: (object: Object3D) => void;
        selectAddition: (object: Object3D) => void;
        addObject3d: (type: string) => void;
        removeObject3d: (object: Object3D) => void;
        duplicateObject3d: (object: Object3D) => void;
        updateParticleSystem: (object: ParticleEmitter) => void;
        updateProperties: () => void;
    }
}

const ApplicationContext = React.createContext<AppContext | null>(null);

export const ApplicationContextConsumer = ApplicationContext.Consumer;

export class ApplicationContextProvider extends React.Component<ApplicationContextProps, AppContext> {

    toonProjectile: ToonProjectile;

    constructor(props: Readonly<ApplicationContextProps>) {
        super(props);

        const scene = new THREE.Scene();

        scene.background = new Color(0x666666);

        this.toonProjectile = new ToonProjectile();
        this.toonProjectile.name = "Toon Projectile";
        scene.add(this.toonProjectile);

        const axisHelper = new AxesHelper(100);
        axisHelper.name = "axisHelper";
        scene.add(axisHelper);

        const light = new PointLight(new Color(1, 1, 1), 0.8, 200);
        light.position.set(50, 50, 50);
        scene.add(light);

        const ambientLight = new AmbientLight(new Color(1, 1, 1), 0.2);
        scene.add(ambientLight);

        const state: AppContext = {
            scene: scene,
            script: this.animate,
            selection: [],
            actions: {
                select: object => {
                    this.setState({selection: [object]});
                },
                selectAddition: object => {
                    if (state.selection.indexOf(object) === -1) {
                        state.selection.push(object);
                        this.setState({selection: state.selection});
                    }
                },
                addObject3d: this.addObject3d,
                removeObject3d: () => {
                },
                duplicateObject3d: () => {
                },
                updateParticleSystem: () => {
                },
                updateProperties: () => {
                    this.setState({scene: scene});
                }
            }
        };

        this.state = state;
    }

    addObject3d = (type: string) => {
        let object;
        switch (type) {
            case 'particle':
                let texture = new TextureLoader().load("textures/texture1.png");
                const particleSystem = new ParticleSystem({
                    maxParticle: 10000,
                    shape: new ConeEmitter(),
                    emissionOverTime: new ConstantValue(100),
                    startLife: new ConstantValue(30),
                    startSpeed: new ConstantValue(10),
                    startSize: new ConstantValue(1),
                    startColor: new ConstantColor(new Vector4(1, 1, 1, 1)),
                    texture: texture,
                    blending: AdditiveBlending,
                    startTileIndex: 0,
                    uTileCount: 10,
                    vTileCount: 10,
                    worldSpace: true,
                });
                object = particleSystem.emitter;
                this.state.scene.add(object);
                break;
            case 'box':
                object = new Mesh(new BoxBufferGeometry(10, 10, 10), new MeshStandardMaterial({color: 0xcccccc}));
                this.state.scene.add(object);
                break;
        }
        if (object) {
            this.state.actions.select(object);
            this.setState({});
        }
    };

    animate = (delta: number) => {
        this.toonProjectile!.position.x += delta * 30;
        if (this.toonProjectile!.position.x > 20)
            this.toonProjectile!.position.x = -20;
        this.state.actions.updateProperties();
    };

    render() {
        //console.log( "rendering ApplicationContext ");
        return (
            <ApplicationContext.Provider value={this.state}>
                {this.props.children}
            </ApplicationContext.Provider>
        )
    }
}
/*
        this.particleSystem = new ParticleSystem({
            maxParticle: 10000,
            shape: new ConeEmitter(),
            emissionOverTime: new ConstantValue(100),
            startLife: new ConstantValue(30),
            startSpeed: new ConstantValue(10),
            startSize: new ConstantValue(1),
            startColor: new ConstantColor(new Vector4(1,1,1, 1)),
            texture: texture,
            blending: AdditiveBlending,
            startTileIndex: 0,
            uTileCount: 10,
            vTileCount: 10,
            worldSpace: true,
        });*/
//this.particleSystem.emitter.position.set(10, 0, 0);
//scene.add(this.particleSystem.emitter);
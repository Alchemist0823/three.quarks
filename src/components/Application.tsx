import * as React from "react";
import {
    Container,
    Divider,
    Dropdown,
    Grid,
    Header,
    List,
    Menu,
    Segment,
    Image,
    Icon,
    Input,
    MenuItemProps, DropdownItemProps, Sidebar
} from "semantic-ui-react";
import {MainMenu} from "./MainMenu";
import {ThreejsViewport} from "./ThreejsViewport";
import {PropertiesEditor} from "./PropertiesEditor";
import { SceneGraphView } from "./SceneGraphView";
import * as THREE from "three";
import { AmbientLight, PointLight, AxesHelper, AdditiveBlending, TextureLoader, Color, Vector4 } from "three";
import { ToonProjectile } from "../example/ToonProjectile";
import { ConstantColor } from "../particle/functions/ColorGenerator";
import { ConstantValue } from "../particle/functions/ConstantValue";
import { ParticleSystem } from "../particle/ParticleSystem";
import { ConeEmitter } from "../particle/shape/ConeEmitter";

interface ApplicationProps {
}

interface ApplicationStates {
    activeItem: string,
    scene: THREE.Scene,
}

export class Application extends React.Component<ApplicationProps, ApplicationStates> {
    handleItemClick = (e: React.MouseEvent, { name }: DropdownItemProps) => this.setState({ activeItem: name! });
    toonProjectile: ToonProjectile;

    constructor(props: Readonly<ApplicationProps>) {
        super(props);
        const scene = new THREE.Scene();

        scene.background = new Color( 0x666666 );

        let texture = new TextureLoader().load( "textures/texture1.png" , ()=>{console.log("load")}, ()=>{console.log("progress")}, (e)=>{console.info(e)});

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

        this.toonProjectile = new ToonProjectile();
        scene.add(this.toonProjectile);

        const axisHelper = new AxesHelper(100);
        scene.add(axisHelper);

        const light = new PointLight(new Color(1,1,1), 0.8, 200);
        light.position.set(50, 50, 50);
        scene.add(light);

        const ambientLight = new AmbientLight(new Color(1, 1, 1), 0.2);
        scene.add(ambientLight);

        //const mesh = new Mesh(new SphereBufferGeometry(5, 32, 16), new MeshStandardMaterial({color: 0xDD6644}));
        //scene.add(mesh);

        this.state = {
            activeItem: "",
            scene: scene
        }
    }

    animate = (delta: number) => {
        this.toonProjectile!.update(delta);
        this.toonProjectile!.position.x += delta * 30;
        if (this.toonProjectile!.position.x > 20)
            this.toonProjectile!.position.x = -20;
    }

    render() {
        const { activeItem } = this.state;

        return (
            <div>
                <Grid>
                    <Grid.Row>
                        <Grid.Column width={16}>
                            <MainMenu></MainMenu>
                        </Grid.Column>
                    </Grid.Row>

                    <Grid.Row>
                        <Grid.Column width={10}>
                            <ThreejsViewport width={600} height={600} scene={this.state.scene} renderCallback={this.animate}/>
                        </Grid.Column>
                        <Grid.Column width={6}>
                            <SceneGraphView scene={this.state.scene}/>
                            <PropertiesEditor />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </div>);
    }
}

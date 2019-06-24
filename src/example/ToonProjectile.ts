import {AdditiveBlending, Group, NormalBlending, TextureLoader, Vector4} from "three";
import {ParticleSystem} from "../particle/ParticleSystem";
import {ConeEmitter} from "../particle/shape/ConeEmitter";
import {IntervalValue} from "../particle/functions/IntervalValue";
import {SizeOverLife} from "../particle/behaviors/SizeOverLife";
import {PiecewiseBezier} from "../particle/functions/PiecewiseBezier";
import {ColorRange} from "../particle/functions/ColorRange";
import {ConstantColor} from "../particle/functions/ColorGenerator";
import {SphereEmitter} from "../particle/shape/SphereEmitter";
import {RotationOverLife} from "../particle/behaviors/RotationOverLife";
import {ConstantValue} from "../particle/functions/ConstantValue";
import {Bezier} from "../particle/functions/Bezier";
import {ColerOverLife} from "../particle/behaviors/ColorOverLife";
import {Gradient} from "../particle/functions/Gradient";
import {RandomColor} from "../particle/functions/RandomColor";

export class ToonProjectile extends Group {
    private particles: ParticleSystem;
    private smoke: ParticleSystem;
    private glowBeam: ParticleSystem;
    private mainBeam: ParticleSystem;

    constructor() {
        super();

        let texture = new TextureLoader().load( "textures/texture1.png");

        this.mainBeam = new ParticleSystem({
            duration: 1,
            looping: true,
            startLife: new IntervalValue(0.1, 0.15),
            startSpeed: new ConstantValue(0),
            startSize: new ConstantValue(1.25),
            startColor: new ConstantColor(new Vector4(1, 1, 1, .5)),
            worldSpace: true,

            maxParticle: 100,
            emissionOverTime: new ConstantValue(40),

            shape: new SphereEmitter({
                radius: .0001,
                thickness: 1,
                arc: Math.PI * 2,
            }),
            texture: texture,
            blending: AdditiveBlending,
            startTileIndex: 0,
            uTileCount: 10,
            vTileCount: 10,
        });
        this.mainBeam.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.25, 0.05, 0), 0]])));
        this.mainBeam.emitter.renderOrder = 2;
        this.mainBeam.emitter.name = 'mainBeam';

        this.add(this.mainBeam.emitter);

        this.glowBeam = new ParticleSystem({
            duration: 1,
            looping: true,
            startLife: new IntervalValue(0.1, 0.15),
            startSpeed: new ConstantValue(0),
            startSize: new ConstantValue(3.5),
            startColor: new ConstantColor(new Vector4(1, 0.1509503, 0.07352942, .5)),
            worldSpace: true,

            maxParticle: 100,
            emissionOverTime: new ConstantValue(40),

            shape: new SphereEmitter({
                radius: .0001,
                thickness: 1,
                arc: Math.PI * 2,
            }),
            texture: texture,
            blending: AdditiveBlending,
            startTileIndex: 1,
            uTileCount: 10,
            vTileCount: 10,
        });
        this.glowBeam.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.95, 0.75, 0), 0]])));
        this.glowBeam.emitter.renderOrder = 2;
        this.glowBeam.emitter.name = 'glowBeam';

        this.add(this.glowBeam.emitter);


        this.particles = new ParticleSystem({
            duration: 1,
            looping: true,
            startLife: new IntervalValue(0.3, 0.6),
            startSpeed: new IntervalValue(2, 5),
            startSize: new IntervalValue(.1, .4),
            startColor: new RandomColor(new Vector4(1,1,1,.5), new Vector4(1, 0.1509503, 0.07352942, .5)),
            worldSpace: true,

            maxParticle: 100,
            emissionOverTime: new ConstantValue(60),

            shape: new ConeEmitter({
                angle: 4.8423 / 180 * Math.PI,
                radius: .3,
                thickness: 1,
                arc: Math.PI * 2,
            }),
            texture: texture,
            blending: NormalBlending,
            startTileIndex: 0,
            uTileCount: 10,
            vTileCount: 10,
        });
        this.particles.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.25, 0.05, 0), 0]])));
        this.particles.emitter.renderOrder = 2;
        this.particles.emitter.rotateY(-Math.PI/2);
        this.particles.emitter.name = 'particles';

        this.add(this.particles.emitter);

        this.smoke = new ParticleSystem({
            startLife: new IntervalValue(0.25, 0.3),
            startSpeed: new ConstantValue(0),
            startSize: new IntervalValue(.75, 1.25),
            startRotation: new IntervalValue(0, Math.PI * 2),
            startColor: new ConstantColor(new Vector4(1,1,1,.5)),
            worldSpace: true,

            maxParticle: 100,
            emissionOverTime: new ConstantValue(20),
            shape: new SphereEmitter({
                radius: .2,
                thickness: 1,
            }),

            texture: texture,
            blending: NormalBlending,
            startTileIndex: 2,
            uTileCount: 10,
            vTileCount: 10,
        });
        this.smoke.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.95, 0.75, 0), 0]])));
        this.smoke.addBehavior(new ColerOverLife(new ColorRange(new Vector4(1, 0.1509503, 0.07352942, 1), new Vector4(0, 0, 0, 0))));
        this.smoke.addBehavior(new RotationOverLife(new IntervalValue(-Math.PI * 2, Math.PI * 2)));
        this.smoke.emitter.renderOrder = -2;
        this.smoke.emitter.name = 'smoke';

        this.add(this.smoke.emitter);

    }

    update(delta: number) {
        this.mainBeam.update(delta);
        this.glowBeam.update(delta);
        this.particles.update(delta);
        this.smoke.update(delta);
    }
}

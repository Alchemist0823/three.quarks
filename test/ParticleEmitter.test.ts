import {
    ParticleSystem,
    IntervalValue,
    ConstantValue,
    ConstantColor,
    SphereEmitter,
    SizeOverLife,
    PiecewiseBezier,
    Bezier,
    ParticleEmitter
} from "../src";
import {Vector4, Texture, AdditiveBlending} from "three";
import {QuarksLoader} from "../src/QuarksLoader";


describe("ParticleEmitter", () => {

    const texture = new Texture();
    const glowBeam = new ParticleSystem({
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
    glowBeam.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.95, 0.75, 0), 0]])));
    glowBeam.emitter.renderOrder = 2;
    glowBeam.emitter.name = 'glowBeam';

    test(".toJSON", () => {

        const meta = { geometries: {}, materials: {}, textures: {}, images: {} };
        const json = glowBeam.emitter.toJSON(meta);

        //expect(meta.textures).toBe();
        expect(json.object.ps.duration).toBe(1);
        expect(json.object.ps.looping).toBe(true);
        expect(json.object.ps.startLife.type).toBe("IntervalValue");
        expect(json.object.ps.startSpeed.type).toBe("ConstantValue");
        expect(json.object.ps.startSize.type).toBe("ConstantValue");
        expect(json.object.ps.startColor.type).toBe("ConstantColor");
        expect(json.object.ps.worldSpace).toBe(true);
        expect(json.object.ps.maxParticle).toBe(100);
        expect(json.object.ps.emissionOverTime.type).toBe("ConstantValue");
        expect(json.object.ps.shape.type).toBe("sphere");
        expect(json.object.ps.shape.radius).toBe(0.0001);
        expect(json.object.ps.shape.thickness).toBe(1);
        expect(json.object.ps.shape.arc).toBe(Math.PI * 2);
        //expect(json.object.ps.texture).toBe(1);
        expect(json.object.ps.blending).toBe(AdditiveBlending);
        expect(json.object.ps.startTileIndex).toBe(1);
        expect(json.object.ps.uTileCount).toBe(10);
        expect(json.object.ps.vTileCount).toBe(10);

        expect(json.object.ps.behaviors.length).toBe(1);
        expect(json.object.ps.behaviors[0].type).toBe("SizeOverLife");
        expect(json.object.ps.behaviors[0].func.type).toBe("PiecewiseBezier");
    });

    test(".fromJSON", ()=> {
        //const meta = { geometries: {}, materials: {}, textures: {}, images: {} };
        const json = glowBeam.emitter.toJSON();
        const loader = new QuarksLoader();
        const emitter = loader.parse(json, () => {}) as ParticleEmitter;

        expect(emitter.system.startTileIndex).toBe(1);
        expect(emitter.system.behaviors.length).toBe(1);
    });
});

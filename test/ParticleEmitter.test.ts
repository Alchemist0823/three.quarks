/**
 * @jest-environment jsdom
 */
import {
    ApplyForce,
    Bezier,
    ConstantColor,
    ConstantValue,
    IntervalValue,
    ParticleEmitter,
    ParticleSystem,
    PiecewiseBezier,
    RenderMode,
    SizeOverLife,
    SphereEmitter, TrailSettings
} from "../src";
import {AdditiveBlending, NormalBlending, Texture, Vector3, Vector4} from "three";
import {QuarksLoader} from "../src/QuarksLoader";
import {BatchedRenderer} from "../src/BatchedRenderer";


describe("ParticleEmitter", () => {


    const renderer = new BatchedRenderer();
    const texture = new Texture();
    const glowBeam = new ParticleSystem({
        duration: 1,
        looping: true,
        startLife: new IntervalValue(0.1, 0.15),
        startSpeed: new ConstantValue(0),
        startSize: new ConstantValue(3.5),
        startColor: new ConstantColor(new Vector4(1, 0.1509503, 0.07352942, .5)),
        rendererEmitterSettings: {startLength: new ConstantValue(40)},
        worldSpace: true,
        emissionOverTime: new ConstantValue(40),

        shape: new SphereEmitter({
            radius: .0001,
            thickness: 1,
            arc: Math.PI * 2,
        }),
        texture: texture,
        blending: NormalBlending,
        startTileIndex: new ConstantValue(1),
        uTileCount: 10,
        vTileCount: 10,
        renderOrder: 2,
        renderMode: RenderMode.Trail
    });
    glowBeam.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.95, 0.75, 0), 0]])));
    glowBeam.addBehavior(new ApplyForce(new Vector3(0, 1, 0), new ConstantValue(10)));
    glowBeam.emitter.name = 'glowBeam';
    renderer.addSystem(glowBeam);

    test(".toJSON", () => {

        const meta = { geometries: {}, materials: {}, textures: {}, images: {}, shapes: {}, skeletons: {}, animations: {}, nodes: {} };
        const json = glowBeam.emitter.toJSON(meta);

        //expect(meta.textures).toBe();
        expect(json.object.ps.duration).toBe(1);
        expect(json.object.ps.looping).toBe(true);
        expect(json.object.ps.startLife.type).toBe("IntervalValue");
        expect(json.object.ps.startSpeed.type).toBe("ConstantValue");
        expect(json.object.ps.startSize.type).toBe("ConstantValue");
        expect(json.object.ps.startColor.type).toBe("ConstantColor");
        expect(json.object.ps.rendererEmitterSettings.startLength.type).toBe("ConstantValue");
        expect(json.object.ps.worldSpace).toBe(true);
        expect(json.object.ps.emissionOverTime.type).toBe("ConstantValue");
        expect(json.object.ps.shape.type).toBe("sphere");
        expect(json.object.ps.shape.radius).toBe(0.0001);
        expect(json.object.ps.shape.thickness).toBe(1);
        expect(json.object.ps.shape.arc).toBe(Math.PI * 2);
        //expect(json.object.ps.texture).toBe(1);
        expect(json.object.ps.blending).toBe(NormalBlending);
        expect(json.object.ps.startTileIndex.value).toBe(1);
        expect(json.object.ps.uTileCount).toBe(10);
        expect(json.object.ps.vTileCount).toBe(10);
        expect(json.object.ps.renderOrder).toBe(2);
        expect(json.object.ps.instancingGeometry).toBeDefined();

        expect(json.object.ps.behaviors.length).toBe(2);
        expect(json.object.ps.behaviors[0].type).toBe("SizeOverLife");
        expect(json.object.ps.behaviors[0].size.type).toBe("PiecewiseBezier");
        expect(json.object.ps.behaviors[1].type).toBe("ApplyForce");
        expect(json.object.ps.behaviors[1].direction[1]).toBe(1);
        expect(json.object.ps.behaviors[1].magnitude.type).toBe("ConstantValue");

        expect(Object.keys(meta.geometries).length).toBe(1);
    });

    test(".clone", ()=> {
        const newPS = glowBeam.clone();
        expect(newPS.behaviors.length).toBe(glowBeam.behaviors.length);
        expect(newPS.blending).toBe(glowBeam.blending);
        expect((newPS.rendererEmitterSettings as TrailSettings).startLength.type).toBe((newPS.rendererEmitterSettings as TrailSettings).startLength.type);
    })

    test(".fromJSON", () => {
        //const meta = { geometries: {}, materials: {}, textures: {}, images: {} };
        const json = glowBeam.emitter.toJSON();
        const loader = new QuarksLoader();
        const emitter = loader.parse(json, () => {
        }) as ParticleEmitter<Event>;
        expect(emitter.system.startTileIndex.type).toBe("value");
        expect(emitter.system.rendererSettings.instancingGeometry).toBeDefined();
        expect((emitter.system.rendererEmitterSettings as TrailSettings).startLength!.type).toBe("value");
        expect(emitter.system.behaviors.length).toBe(2);

    });
});

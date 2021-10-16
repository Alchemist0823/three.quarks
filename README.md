# three.quarks
![npm](https://img.shields.io/npm/v/three.quarks.svg)
![test status](https://travis-ci.org/Alchemist0823/three.quarks.svg?branch=master)
![Github Star](https://img.shields.io/github/stars/Alchemist0823/three.quarks.svg?style=social)

**three.quarks** is a high-performance javascript particle system based visual effect library for threejs
 written in modern **TypeScript**.
 
 ## [Demo](https://alchemist0823.github.io/three.quarks/)

If you ever developed 3D applications on browsers, you must know the well-known
 WebGL library called [three.js](https://threejs.org). Now you have 
 [three.quarks](https://github.com/Alchemist0823/three.quarks) a high-performance particle
  system library with a WYSIWYG visual editor 
  [three.quarks-editor](https://github.com/Alchemist0823/three.quarks-editor) for it.

three.quarks Particle Engine provides following features:

- Group Particle System
- Batch Render Multiple Particle System (reduce draw calls) - [BatchedParticleRenderer](https://github.com/Alchemist0823/three.quarks/tree/master/src/BatchedParticleRenderer.ts)
- Emission Shape and Control
- Customizable Behaviors
- Customizable RenderMode and BlendMode
- 1D Bézier curve function for adjusting
- Texture Atlas Animation
- User Extension and Customization
- A realtime editor to test and create visual effects [three.quarks-editor](https://github.com/Alchemist0823/three.quarks-editor)
- VFX json load and save 

three.quarks computes most particles information on CPU, and it uses customized shader
 and instancing technique to render those particles. three.quarks supports 1 dimension
 Bezier Curves for the best transform visual effect. Most importantly, developers can
 customize how the particle system works by adding their own Behavior.

### Examples

Launch Examples

```bash
yarn example
```

#### Check [examples](examples) folder


Add particle system to the scene

```javascript
const batchSystem = new BatchedParticleRenderer();
const texture = new TextureLoader().load("atlas.png");
// Particle system configuration
const muzzle = {
    duration: 1,
    looping: false,
    startLife: new IntervalValue(0.1, 0.2),
    startSpeed: new ConstantValue(0),
    startSize: new IntervalValue(1, 5),
    startColor: new ConstantColor(new Vector4(1, 1, 1, 1)),
    worldSpace: false,

    maxParticle: 5,
    emissionOverTime: new ConstantValue(0),
    emissionBursts: [{
        time: 0,
        count: 1,
        cycle: 1,
        interval: 0.01,
        probability: 1,
    }],

    shape: new PointEmitter(),
    texture: texture,
    blending: AdditiveBlending,
    startTileIndex: 91,
    uTileCount: 10,
    vTileCount: 10,
    renderOrder: 2,
    renderMode: RenderMode.LocalSpaceBillBoard
};

// Create particle system based on your configuration
muzzle1 = new ParticleSystem(batchSystem, {muzzle});
// developers can customize how the particle system works by 
// using existing behavior or adding their own Behavior.
muzzle1.addBehavior(new ColorOverLife(new ColorRange(new Vector4(1, 0.3882312, 0.125, 1), new Vector4(1, 0.826827, 0.3014706, 1))));
muzzle1.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.95, 0.75, 0), 0]])));
// texture atlas animation
muzzle1.addBehavior(new FrameOverLife(new PiecewiseBezier([[new Bezier(91, 94, 97, 100), 0]])));
muzzle1.emitter.name = 'muzzle1';
muzzle1.emitter.position.x = 1;

// Add emitter to your Object3D
scene.add(muzzle1.emitter);
```

Add particle system update in your main loop

```javascript
// update particle system
muzzle1.update(delta);
// update batched renderer
batchSystem.update();
```

#### Import VFX JSON

```javascript
let loader = new QuarksLoader();
loader.setCrossOrigin("");
loader.load(jsonURL, (object3D: Object3D)=>{
    this.state.scene.add(object3D);
}, ()=>{}, ()=>{});
```

Note: the texture url reference is defined by the texture's name field.
you may need to modify the texture url in json as needed.

#### Export VFX JSON
```javascript
JSON.stringify(muzzle1.emitter.toJSON())
JSON.stringify(muzzle1.emitter.parent.toJSON())
```


### three.quarks-editor

three.quarks-editor can help you preview a set of particle system at once.
 and you can also adjust all the particle system at real time and export those system
  as a JSON file. Your app or game can load those JSON file later. It even includes a 
  Javascript scripting system to test those effect in a similar environment to your 
  application.

### Install
#### Package install
```bash
yarn install three.quarks
```

#### browser install

### Tests
Check [test](test) folder

More examples will come up later.

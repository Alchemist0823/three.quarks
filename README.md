# three.quarks ✨

[![npm][npm]][npm-url]
[![npm-downloads][npm-downloads]][npmtrends-url]
[![build-size][build-size]][build-size-url]
[![github][github-star]][github-url]
[![discord][discord]][discord-url]

**three.quarks** is a high-performance particle system and visual effects library for [three.js](https://threejs.org), written in TypeScript.

Create stunning real-time VFX for games, interactive experiences, and web applications with an intuitive API and powerful visual editor.

![landing image](./landing.png)

## 🎮 Try the Demo

> **[▶️ Launch Live Demo](https://demo.quarks.art/)** - See three.quarks in action with interactive examples!

## 🔗 Quick Links

| | Resource | Description |
|--|----------|-------------|
| 📖 | [Documentation](https://quarks.art/) | Official website and guides |
| 🎨 | [Visual Editor](https://quarks.art/create) | WYSIWYG particle effect creator |
| 💬 | [Discord](https://discord.gg/5Tv3kJCrQZ) | Community support and discussion |

## 🚀 Why three.quarks?

- ⚡ **High Performance** - Optimized batch rendering minimizes draw calls
- 🖥️ **CPU or GPU Simulation** - Simulate on the CPU with any renderer, or with compute shaders on WebGPU
- 🎮 **Unity Compatible** - Import particle systems from Unity's Shuriken system
- 🎨 **Visual Editor** - Design effects visually with [three.quarks-editor](https://quarks.art/create)
- 🔧 **Flexible** - Extensible plugin system for custom behaviors and emitters
- ✅ **Production Ready** - Used in games and interactive applications

## 📦 Installation

```bash
npm install three.quarks
```

## ⚡ Quick Start

```javascript
import * as THREE from 'three';
import {
    BatchedRenderer,
    ParticleSystem,
    ConstantValue,
    IntervalValue,
    ConstantColor,
    PointEmitter,
    RenderMode
} from 'three.quarks';

// 1. Create the batch renderer (manages all particle systems)
const batchRenderer = new BatchedRenderer();
scene.add(batchRenderer);

// 2. Define your particle system
const particles = new ParticleSystem({
    duration: 2,
    looping: true,
    startLife: new IntervalValue(1, 2),
    startSpeed: new ConstantValue(5),
    startSize: new IntervalValue(0.1, 0.3),
    startColor: new ConstantColor(new THREE.Vector4(1, 1, 1, 1)),
    maxParticle: 100,
    emissionOverTime: new ConstantValue(20),
    shape: new PointEmitter(),
    material: new THREE.MeshBasicMaterial({
        map: yourTexture,
        transparent: true
    }),
    renderMode: RenderMode.BillBoard
});

// 3. Add to scene and renderer
scene.add(particles.emitter);
batchRenderer.addSystem(particles);

// 4. Update in your animation loop
function animate() {
    const delta = clock.getDelta();
    batchRenderer.update(delta);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
```

## 🌐 WebGPU (three.js `WebGPURenderer`)

three.quarks also works with three.js' [`WebGPURenderer`](https://threejs.org/docs/#api/en/renderers/webgpu/WebGPURenderer).
Your particle systems, behaviors, emitters and JSON effects stay the same; only the batch renderer is imported from
`three.quarks/webgpu`. On browsers without WebGPU it falls back to WebGL2 automatically.

```javascript
import {WebGPURenderer} from 'three/webgpu';
import {BatchedRenderer, ParticleSystem /* ... */} from 'three.quarks/webgpu';

const renderer = new WebGPURenderer({antialias: true});
await renderer.init();

const batchRenderer = new BatchedRenderer({target: 'auto'}); // 'desktop' (default) | 'mobile' | 'auto'
scene.add(batchRenderer);

renderer.setAnimationLoop(() => {
    batchRenderer.update(clock.getDelta());
    renderer.render(scene, camera);
});
```

| | WebGL `BatchedRenderer` | WebGPU `BatchedRenderer` (`three.quarks/webgpu`) |
|---|---|---|
| Billboard / vertical / horizontal / stretched / mesh / trail | ✅ | ✅ |
| Lit mesh particles (`MeshStandardMaterial`, `MeshPhysicalMaterial`, env maps) | ✅ | ✅ |
| Sprite sheets, frame blending, alpha test, custom blending, layers, render order | ✅ | ✅ |
| Soft particles | ✅ needs a depth pre-pass + `setDepthTexture` | ✅ automatic |
| GPU simulation (see below) | ❌ | ✅ |

- **`target`**: `'desktop'` looks exactly like WebGL, `'mobile'` turns off soft particles and uses cheaper shading for
  phones, `'auto'` picks one for the device. Each option can still be set by hand, e.g.
  `{target: 'mobile', softParticles: true}`.
- **Colors**: particles look like WebGL, except that overlapping transparent particles can come out slightly lighter.
  For an exact match, render with `new QuarksCompositor(renderer, batchRenderer).render(scene, camera)` instead of
  `renderer.render(scene, camera)` (create the compositor once).

**React Three Fiber 9.** Pass the WebGPU batch renderer to the provider and create `WebGPURenderer` in the canvas:

```jsx
import {WebGPURenderer} from 'three/webgpu';
import {WebGPUBatchedRenderer} from 'three.quarks/webgpu';

<Canvas gl={async (props) => { const r = new WebGPURenderer(props); await r.init(); return r; }}>
    <QuarksProvider createBatchedRenderer={(gl) => new WebGPUBatchedRenderer({target: 'auto', renderer: gl, gpuSimulation: 'auto'})}>
        ...
    </QuarksProvider>
</Canvas>
```

## ⚙️ CPU and GPU Simulation

three.quarks can move your particles in two ways:

- **CPU simulation**: the default. Works with every renderer and every feature.
- **GPU simulation**: the graphics card moves the particles (WebGPU only). Hundreds of thousands of particles cost
  almost no CPU time, which leaves the main thread free for your game or app.

Your effects don't change: the same particle systems, behaviors and JSON files run either way. GPU simulation is turned
on with one option, and the choice is made for each particle system, so one scene can mix both.

### Which one should I use?

| Your scene | Best choice |
|---|---|
| Many particle systems with only a few particles each (muzzle flashes, sparks, hit effects, UI effects) | **CPU** |
| Particle systems with more than ~10k particles (smoke, rain, snow, fireflies, swarms, magic fields) | **GPU** |
| Big bursts: an explosion that spawns thousands of particles at once | **GPU** |
| Both kinds in one scene | **`'auto'`**: large systems go to the GPU, small ones stay on the CPU |
| Your code reads particle positions, listens to `particleDied` or needs an exact particle count | **CPU** |
| Effects with trails, ApplySequences or sub-emitters (the parent system) | **CPU** (chosen automatically) |
| WebGL renderer, or a browser without WebGPU | **CPU** (the only option) |

Why: every GPU simulated system has a small fixed cost each frame, so a system with a few hundred particles is just as
fast, or faster, on the CPU. On the CPU the cost grows with every particle, while on the GPU it stays almost flat:

| CPU time per frame (RTX 4080 Laptop GPU) | CPU simulation | GPU simulation |
|---|---:|---:|
| 20 systems × 250 mesh particles (5k in total) | **0.98 ms** | 1.46 ms |
| 20 systems × 10k billboards (200k in total) | 22.3 ms (42 fps) | **0.46 ms** (250 fps, capped) |
| 20 systems × 25k billboards (500k in total) | 62.2 ms (17 fps) | **0.47 ms** (250 fps, capped) |

A 100k-particle explosion costs 0.16 ms of CPU on the GPU path. Open `benchmark.html` to measure your own devices.

### Renderer support

| Renderer | CPU simulation | GPU simulation | Use case |
|---|:---:|:---:|---|
| `BatchedRenderer` from `three.quarks` (`WebGLRenderer`) | ✅ | ❌ | Existing WebGL apps, the widest device support |
| `BatchedRenderer` from `three.quarks/webgpu` (`WebGPURenderer` on WebGPU) | ✅ | ✅ | Large effects, CPU-heavy apps, new projects |
| `BatchedRenderer` from `three.quarks/webgpu` (`WebGPURenderer` on its WebGL2 fallback) | ✅ | falls back to the CPU automatically | The same code on browsers without WebGPU |

With `quarks.r3f`, simulation follows the batch renderer you pass to `QuarksProvider` (see React Three Fiber 9 above).

### Turning it on

```javascript
import {WebGPURenderer} from 'three/webgpu';
import {BatchedRenderer} from 'three.quarks/webgpu';

const renderer = new WebGPURenderer();
await renderer.init();

const batchRenderer = new BatchedRenderer({
    renderer, // needed for GPU simulation
    gpuSimulation: 'auto', // 'off' (default) | 'auto' | 'all'
    gpuSimulationThreshold: 10000, // 'auto': systems with fewer particles stay on the CPU (default 128)
});
scene.add(batchRenderer);
// add systems and call batchRenderer.update(delta) as usual
```

- `gpuSimulation: 'off'` keeps everything on the CPU, `'auto'` sends systems with at least `gpuSimulationThreshold`
  particles to the GPU, `'all'` sends every supported system to the GPU.
- `'auto'` estimates each system's particle count from its emission rate, lifetime and bursts. If your scene is made of
  many small systems, keep the threshold high so they stay on the CPU.
- Switch at runtime with `batchRenderer.setGPUSimulation('off' | 'auto' | 'all')`.
- `batchRenderer.isGPUSimulated(system)` tells you where a system runs, and `batchRenderer.getGPUSimulationSupport(system)`
  tells you why it stays on the CPU.
- To keep one particular system on the CPU, add it to a second batch renderer created with `gpuSimulation: 'off'`.

### What runs on the GPU

| Feature | CPU | GPU |
|---|:---:|:---:|
| Billboards, stretched / vertical / horizontal billboards, mesh particles | ✅ | ✅ |
| Trails | ✅ | ❌ |
| Emitter shapes: point, sphere, hemisphere, cone, circle, donut, rectangle, grid | ✅ | ✅ |
| Mesh surface and custom emitter shapes | ✅ | ✅ |
| Color, size, rotation, speed, frame (sprite sheet), orbit and force over life; speed limit | ✅ | ✅ |
| Color, size and rotation by speed | ✅ | ✅ |
| ApplyForce, GravityForce, Noise, TurbulenceField, ChangeEmitDirection | ✅ | ✅ |
| Curves, gradients and random ranges for every value | ✅ | ✅ |
| ApplySequences | ✅ | ❌ |
| Sub-emitters | ✅ | the child can run on the GPU, the parent stays on the CPU |
| Custom behaviors | ✅ | ✅ after `registerGPUBehavior`, otherwise CPU |
| `particleDied` events, reading `system.particles` | ✅ | ❌ |
| `system.particleNum` | exact | estimate |
| Node graph effects (`NodeVFX`) | ✅ | ✅ with `import 'quarks.nodes/webgpu'` |

A system that uses a ❌ feature stays on the CPU automatically while the rest of the scene runs on the GPU. Effects look
the same on both paths, but individual particles differ because each path uses its own random numbers.

### Node graph effects (`quarks.nodes`)

`NodeVFX` builds an effect from three node graphs: the **emission graph** decides when and how many particles to
spawn, the **init graph** sets up each new particle, and the **update graph** changes every particle each frame
(position, velocity, color, size, rotation, sprite frame, life). Node graph effects work with every renderer; one extra
import lets them run on the GPU:

```javascript
import {NodeVFX} from 'quarks.nodes';
import 'quarks.nodes/webgpu'; // lets NodeVFX effects run on the GPU

const vfx = new NodeVFX({emissionGraph, initGraph, updateGraph, material, maxParticles: 5000});
batchRenderer.addSystem(vfx);
scene.add(vfx.emitter);
```

Node graphs run for every particle, so they gain the most from the GPU: the vortex demo drops from 36.5 ms to 0.6 ms of
CPU per frame. Effects save to JSON and load with `QuarksLoader`. See `nodeBasedVFXDemo.js` for a complete effect.

## 📂 Loading VFX from JSON

Export effects from the visual editor and load them at runtime:

```javascript
import { QuarksLoader, QuarksUtil, BatchedRenderer } from 'three.quarks';

const batchRenderer = new BatchedRenderer();
const loader = new QuarksLoader();

loader.load('effects/explosion.json', (effect) => {
    QuarksUtil.addToBatchRenderer(effect, batchRenderer);
    scene.add(effect);
});

scene.add(batchRenderer);
```

### Playing Multiple Instances

```javascript
// Clone and play the effect multiple times
const instance = loadedEffect.clone();
scene.add(instance);

QuarksUtil.addToBatchRenderer(instance, batchRenderer);
QuarksUtil.setAutoDestroy(instance, true); // Auto-cleanup when finished
QuarksUtil.play(instance);
```

## ⚛️ React Three Fiber

Use the `quarks.r3f` package for declarative React integration:

```bash
npm install quarks.r3f three.quarks
```

```tsx
import { Canvas } from '@react-three/fiber'
import { QuarksProvider, ParticleSystem } from 'quarks.r3f'
import { ConeEmitter, SizeOverLife, PiecewiseBezier, Bezier, RenderMode } from 'three.quarks'

function FireEffect() {
    const shape = useMemo(() => new ConeEmitter({ angle: 0.3, radius: 0.2 }), [])
    const behaviors = useMemo(() => [
        new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.5, 0.2, 0), 0]]))
    ], [])

    return (
        <ParticleSystem
            duration={5}
            looping
            startLife={[1, 2]}
            startSpeed={[2, 4]}
            startSize={0.5}
            startColor={{ r: 1, g: 0.5, b: 0.2, a: 1 }}
            emissionOverTime={40}
            shape={shape}
            renderMode={RenderMode.BillBoard}
            behaviors={behaviors}
            position={[0, 0, 0]}
            autoPlay
        />
    )
}

function App() {
    return (
        <Canvas>
            <QuarksProvider>
                <FireEffect />
            </QuarksProvider>
        </Canvas>
    )
}
```

See [quarks.r3f documentation](./packages/quarks.r3f/README.md) for full API reference.

## ✨ Features

### 🎬 Renderers
- **WebGL** (`three.quarks`) and **WebGPU** (`three.quarks/webgpu`) batch renderers
- **Billboard** - Camera-facing sprites
- **Stretched Billboard** - Velocity-aligned sprites
- **Mesh** - 3D geometry particles
- **Trail** - Ribbon trails behind particles

### 📐 Emitter Shapes
- Point, Sphere, Hemisphere, Cone, Circle
- Mesh Surface - Emit from 3D model surfaces
- Grid - Structured emission patterns

### 🎭 Behaviors
- Color over lifetime
- Size over lifetime
- Rotation over lifetime
- Force fields
- Orbital motion
- Texture animation
- Sub-emitters
- Custom behaviors via plugin system

### 🎨 Materials
- MeshBasicMaterial (unlit)
- MeshStandardMaterial (PBR)
- Configurable blending modes
- Texture atlas support

## 🧪 Examples

Browse the [examples folder](./packages/quarks.examples) or run locally:

```bash
npm install
npm run build
npm run examples
```

Open `vanilla.html` (WebGL), `vanilla-webgpu.html` (same demos on WebGPU, `?target=desktop|mobile|auto`; `?sim=gpu`
or `?sim=all` turns on GPU simulation, add `&emit=cpu` for CPU emission) or `benchmark.html` (WebGL vs WebGPU and CPU
vs GPU simulation frame timings). `node packages/quarks.examples/scripts/build-showcase.mjs` builds
a static, bundler-free copy of the demos and the benchmark.

## 📦 Packages

This project is a monorepo with modular packages:

| Package | Description |
|---------|-------------|
| **[three.quarks](https://www.npmjs.com/package/three.quarks)** | 🎯 Main package - Three.js particle system with batched rendering, shaders, and full VFX toolkit |
| **[quarks.core](https://www.npmjs.com/package/quarks.core)** | 🧱 Core library - Framework-agnostic math, behaviors, emitter shapes, and functions (zero dependencies) |
| **[quarks.r3f](https://www.npmjs.com/package/quarks.r3f)** | ⚛️ React Three Fiber - Declarative R3F components with hooks, Suspense support, and flexible props API |
| **[quarks.nodes](https://www.npmjs.com/package/quarks.nodes)** | 🔮 Node system - Node graph based VFX (`NodeVFX`), CPU interpreter and TSL compiler for GPU simulation (`quarks.nodes/webgpu`) |
| **quarks.examples** | 🎮 Examples - Interactive demos showcasing particle effects and features |
| **quarks.playground** | 🧪 Playground - Development sandbox for testing and experimenting with effects |

### 🛠️ Editor

- **[three.quarks-editor](https://quarks.art/create)** - Visual editor for creating and previewing particle effects with real-time preview and JSON export

## 📚 Resources

- [Change Log](./CHANGELOG.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Development Guide](./DEVELOPMENT_GUIDE.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [CodeSandbox Example](https://codesandbox.io/s/three-quarks-atom-particle-system-xp3fvz)
- [React Three Fiber Package](./packages/quarks.r3f) - Official R3F integration

## 🗺️ Roadmap

- ✅ WebGPU rendering support
- ✅ GPU (compute shader) particle simulation and emission
- ✅ Node-based scriptable particle systems
- 🔲 GPU trails
- 🔲 WebAssembly particle simulation
- 🔲 Cross-platform native plugins

## 📄 License

MIT

[github-star]: https://img.shields.io/github/stars/Alchemist0823/three.quarks.svg?style=flat
[github-url]: https://github.com/Alchemist0823/three.quarks
[npm]: https://img.shields.io/npm/v/three.quarks
[npm-url]: https://www.npmjs.com/package/three.quarks
[build-size]: https://badgen.net/bundlephobia/minzip/three.quarks
[build-size-url]: https://bundlephobia.com/result?p=three.quarks
[npm-downloads]: https://img.shields.io/npm/dw/three.quarks
[npmtrends-url]: https://www.npmtrends.com/three.quarks
[discord]: https://img.shields.io/discord/1042342883056963664
[discord-url]: https://discord.gg/5Tv3kJCrQZ

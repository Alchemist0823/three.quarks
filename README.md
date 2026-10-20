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

## 🖥️ WebGPURenderer

three's `WebGPURenderer` compiles node materials rather than `ShaderMaterial`, so render with the batched renderer from the `three.quarks/webgpu` entry. Particle systems, behaviors and effect JSON stay the same, and it runs on both of `WebGPURenderer`'s backends (WebGPU and WebGL 2):

```javascript
import { WebGPURenderer } from 'three/webgpu';
import { QuarksLoader, QuarksUtil } from 'three.quarks';
import { NodeBatchedRenderer } from 'three.quarks/webgpu';

const renderer = new WebGPURenderer();
const batchRenderer = new NodeBatchedRenderer();
scene.add(batchRenderer);

new QuarksLoader().load('effects/explosion.json', (effect) => {
    QuarksUtil.addToBatchRenderer(effect, batchRenderer);
    scene.add(effect);
});
```

The node batches draw what the WebGL batches draw. With the default sRGB output, though, `WebGPURenderer` blends and tone maps in linear space, so faint or overlapping transparent particles come out brighter than with `WebGLRenderer`.

Transparent soft particles need no `setDepthTexture` here: without one they fade against the depth the render has drawn before them, the opaque objects, which saves rendering the scene a second time. Opaque soft particles still need a depth texture. three cannot copy that depth with `stencil: true`, nor when it draws straight to the canvas (linear output and no tone mapping) on the WebGL 2 backend or with a reversed depth buffer; give the particles a depth texture there.

A new kind of effect builds its shaders the first time it is drawn. To keep that out of the frame where it appears, compile it once it is in the scene, for instance while loading:

```javascript
QuarksUtil.addToBatchRenderer(effect, batchRenderer);
scene.add(effect);
await renderer.compileAsync(scene, camera);
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

## 📦 Packages

This project is a monorepo with modular packages:

| Package | Description |
|---------|-------------|
| **[three.quarks](https://www.npmjs.com/package/three.quarks)** | 🎯 Main package - Three.js particle system with batched rendering, shaders, and full VFX toolkit |
| **[quarks.core](https://www.npmjs.com/package/quarks.core)** | 🧱 Core library - Framework-agnostic math, behaviors, emitter shapes, and functions (zero dependencies) |
| **[quarks.r3f](https://www.npmjs.com/package/quarks.r3f)** | ⚛️ React Three Fiber - Declarative R3F components with hooks, Suspense support, and flexible props API |
| **[quarks.nodes](https://www.npmjs.com/package/quarks.nodes)** | 🔮 Node system - Experimental node-based VFX with visual programming and WebGPU compute support |
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

- ✅ WebGPU rendering support (`three.quarks/webgpu`)
- 🔲 WebAssembly particle simulation
- 🔲 Node-based scriptable particle systems
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

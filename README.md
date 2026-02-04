# three.quarks

[![npm][npm]][npm-url]
[![npm-downloads][npm-downloads]][npmtrends-url]
[![build-size][build-size]][build-size-url]
[![github][github-star]][github-url]
[![discord][discord]][discord-url]

**three.quarks** is a high-performance particle system and visual effects library for [three.js](https://threejs.org), written in TypeScript.

Create stunning real-time VFX for games, interactive experiences, and web applications with an intuitive API and powerful visual editor.

![landing image](./landing.png)

## Quick Links

| Resource | Description |
|----------|-------------|
| [Demo](https://demo.quarks.art/) | Live examples and showcase |
| [Documentation](https://quarks.art/) | Official website and guides |
| [Visual Editor](https://quarks.art/create) | WYSIWYG particle effect creator |
| [Discord](https://discord.gg/5Tv3kJCrQZ) | Community support and discussion |

## Why three.quarks?

- **High Performance** - Optimized batch rendering minimizes draw calls
- **Unity Compatible** - Import particle systems from Unity's Shuriken system
- **Visual Editor** - Design effects visually with [three.quarks-editor](https://quarks.art/create)
- **Flexible** - Extensible plugin system for custom behaviors and emitters
- **Production Ready** - Used in games and interactive applications

## Installation

```bash
npm install three.quarks
```

## Quick Start

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

## Loading VFX from JSON

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

## Features

### Renderers
- **Billboard** - Camera-facing sprites
- **Stretched Billboard** - Velocity-aligned sprites
- **Mesh** - 3D geometry particles
- **Trail** - Ribbon trails behind particles

### Emitter Shapes
- Point, Sphere, Hemisphere, Cone, Circle
- Mesh Surface - Emit from 3D model surfaces
- Grid - Structured emission patterns

### Behaviors
- Color over lifetime
- Size over lifetime
- Rotation over lifetime
- Force fields
- Orbital motion
- Texture animation
- Sub-emitters
- Custom behaviors via plugin system

### Materials
- MeshBasicMaterial (unlit)
- MeshStandardMaterial (PBR)
- Configurable blending modes
- Texture atlas support

## Examples

Browse the [examples folder](./packages/quarks.examples) or run locally:

```bash
npm install
npm run build
npm run examples
```

## Ecosystem

- **[three.quarks-editor](https://quarks.art/create)** - Visual editor for creating and previewing effects
- **[quarks.core](https://www.npmjs.com/package/quarks.core)** - Core library (framework-agnostic)
- **[quarks.nodes](https://www.npmjs.com/package/quarks.nodes)** - Node-based VFX system (experimental)

## Resources

- [Change Log](./CHANGELOG.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Development Guide](./DEVELOPMENT_GUIDE.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [CodeSandbox Example](https://codesandbox.io/s/three-quarks-atom-particle-system-xp3fvz)
- [React Three Fiber Example](https://codesandbox.io/s/three-quarks-with-react-three-fiber-llhvxk)

## Roadmap

- WebGPU rendering support
- WebAssembly particle simulation
- Node-based scriptable particle systems
- Cross-platform native plugins

## License

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

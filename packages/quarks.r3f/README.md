# quarks.r3f

React Three Fiber integration for [three.quarks](https://github.com/Alchemist0823/three.quarks) particle systems.

## Installation

```bash
npm install quarks.r3f three.quarks
```

## Quick Start

```tsx
import { Canvas } from '@react-three/fiber'
import { QuarksProvider, ParticleSystem } from 'quarks.r3f'
import { ConeEmitter, SizeOverLife, PiecewiseBezier, Bezier, RenderMode } from 'three.quarks'

function FireEffect() {
    const shape = useMemo(() => new ConeEmitter({ angle: 0.3, radius: 0.2 }), [])
    const behaviors = useMemo(() => [
        new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.8, 0.4, 0), 0]]))
    ], [])

    return (
        <ParticleSystem
            duration={5}
            looping
            startLife={[1, 2]}
            startSpeed={[2, 4]}
            startSize={[0.3, 0.6]}
            startColor={{ r: 1, g: 0.5, b: 0.2, a: 1 }}
            emissionOverTime={40}
            shape={shape}
            renderMode={RenderMode.BillBoard}
            behaviors={behaviors}
            position={[0, 0, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
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

## Components

### `<QuarksProvider>`

Required wrapper component that manages the `BatchedRenderer` for all child particle systems.

```tsx
<Canvas>
    <QuarksProvider>
        {/* All particle systems must be children of QuarksProvider */}
        <ParticleSystem ... />
    </QuarksProvider>
</Canvas>
```

### `<ParticleSystem>`

Declarative particle system component with flexible prop types.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `duration` | `number` | System duration in seconds |
| `looping` | `boolean` | Whether to loop the system |
| `startLife` | `number \| [min, max] \| ValueGenerator` | Particle lifetime |
| `startSpeed` | `number \| [min, max] \| ValueGenerator` | Initial particle speed |
| `startSize` | `number \| [min, max] \| ValueGenerator` | Initial particle size |
| `startColor` | `{r,g,b,a} \| ColorGenerator` | Initial particle color |
| `startRotation` | `number \| [min, max] \| ValueGenerator` | Initial rotation |
| `emissionOverTime` | `number \| [min, max] \| ValueGenerator` | Particles per second |
| `shape` | `EmitterShape` | Emitter shape (ConeEmitter, SphereEmitter, etc.) |
| `material` | `Material` | Three.js material for particles |
| `renderMode` | `RenderMode` | BillBoard, StretchedBillBoard, Mesh, Trail |
| `behaviors` | `Behavior[]` | Array of particle behaviors |
| `uTileCount` | `number` | Texture atlas horizontal tiles |
| `vTileCount` | `number` | Texture atlas vertical tiles |
| `worldSpace` | `boolean` | Emit in world space |
| `position` | `[x, y, z]` | Emitter position |
| `rotation` | `[x, y, z]` | Emitter rotation (Euler angles) |
| `scale` | `[x, y, z]` | Emitter scale |
| `autoPlay` | `boolean` | Start playing automatically (default: true) |

**Ref API:**

```tsx
const systemRef = useRef<ParticleSystemRef>(null)

<ParticleSystem ref={systemRef} ... />

// Control methods
systemRef.current.play()
systemRef.current.pause()
systemRef.current.restart()
systemRef.current.stop()

// Access underlying objects
systemRef.current.system   // ParticleSystem instance
systemRef.current.emitter  // ParticleEmitter (Object3D)
```

### `<QuarksEffect>`

Load particle effects from JSON files with React Suspense support.

```tsx
import { Suspense } from 'react'
import { QuarksEffect } from 'quarks.r3f'

function MyEffect() {
    return (
        <Suspense fallback={null}>
            <QuarksEffect
                url="/effects/explosion.json"
                position={[0, 0, 0]}
                autoPlay
            />
        </Suspense>
    )
}

// Preload effects
QuarksEffect.preload('/effects/explosion.json')
```

## Hooks

### `useQuarks()`

Access the BatchedRenderer from context.

```tsx
import { useQuarks } from 'quarks.r3f'

function MyComponent() {
    const { batchedRenderer } = useQuarks()
    // Use for advanced operations
}
```

### `useParticleSystem(props)`

Imperative hook for creating particle systems.

```tsx
import { useParticleSystem } from 'quarks.r3f'

function MyParticles() {
    const { system, emitter, play, pause, restart } = useParticleSystem({
        duration: 5,
        looping: true,
        startLife: [1, 2],
        // ... other props
    })

    return <primitive object={emitter} position={[0, 1, 0]} />
}
```

### `useQuarksEffect(url)`

Hook for loading JSON effects with Suspense.

```tsx
import { useQuarksEffect } from 'quarks.r3f'

function MyEffect() {
    const { group, systems, play, pause, restart } = useQuarksEffect('/effect.json')
    return <primitive object={group} />
}

// Preload
useQuarksEffect.preload('/effect.json')
```

## Flexible Prop Types

Props like `startLife`, `startSpeed`, `startSize`, and `emissionOverTime` accept flexible types:

```tsx
// Constant value
startLife={2}

// Random range [min, max]
startLife={[1, 3]}

// ValueGenerator from three.quarks
startLife={new IntervalValue(1, 3)}
startLife={new PiecewiseBezier([[new Bezier(1, 2, 3, 4), 0]])}
```

## Behaviors

Use behaviors from `three.quarks` to animate particles over their lifetime:

```tsx
import {
    SizeOverLife,
    ColorOverLife,
    SpeedOverLife,
    RotationOverLife,
    Gradient,
    PiecewiseBezier,
    Bezier,
    Vector4,
} from 'three.quarks'

const behaviors = useMemo(() => [
    // Size fades out
    new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.8, 0.4, 0), 0]])),

    // Color gradient
    new ColorOverLife(new Gradient([
        [new Vector4(1, 0.8, 0.2, 1), 0],
        [new Vector4(1, 0.3, 0.1, 1), 0.5],
        [new Vector4(0.5, 0.1, 0.1, 0), 1],
    ])),

    // Speed decay
    new SpeedOverLife(new PiecewiseBezier([[new Bezier(1, 0.5, 0.2, 0), 0]])),
], [])

<ParticleSystem behaviors={behaviors} ... />
```

## Emitter Shapes

```tsx
import { ConeEmitter, SphereEmitter, PointEmitter } from 'three.quarks'

// Cone emitter (good for fire, fountains)
const cone = new ConeEmitter({ angle: 0.3, radius: 0.2, arc: Math.PI * 2 })

// Sphere emitter (good for explosions, magic effects)
const sphere = new SphereEmitter({ radius: 0.5, thickness: 0.2 })

// Point emitter
const point = new PointEmitter()
```

## License

MIT

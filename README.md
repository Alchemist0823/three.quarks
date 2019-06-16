## THREE.QUARKS

Three.quarks is a fast powerful and general purpose particle engine for [three.js](https://threejs.org).

### Demo

Projectile Demo

Cartoon Demo

The particle system editor is [Here]().

### Install

It includes a core runtime library and a **particle system editor**.

#### Core Runtime

```
npm install three.quarks
```

The runtime library has only one three.js dependency.

It uses GPU instancing and interleaved buffer technology to maximize performance.

Most particle system parameters can be input as bezier curves. For curve parameters,
It has a lookup table for best performance.

#### Editor

```
npm install three.quarks-editor
```

The particle system has an in-house bezier editor and WYSIWYG particle system viewport.

#### Thanks

powered by Three.js, React, Semantic.UI
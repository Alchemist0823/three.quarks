# three.quarks
![npm](https://img.shields.io/npm/v/three.quarks.svg)
![test status](https://travis-ci.org/Alchemist0823/three.quarks.svg?branch=master)
![Github Star](https://img.shields.io/github/stars/Alchemist0823/three.quarks.svg?style=social)

**three.quarks** is a high-performance javascript particle system based visual effect library for threejs
 written in modern **TypeScript**.
 
 ##[Demo](https://alchemist0823.github.io/three.quarks/)

If you have ever developed 3D applications on browsers, you must know the well-known
 WebGL library called [three.js](https://threejs.org). Now you have 
 [three.quarks](https://github.com/Alchemist0823/three.quarks) a high-performance particle
  system library with a WYSIWYG visual editor [three.quarks-editor](https://github.com/Alchemist0823/three.quarks-editor) for it.

three.js is so powerful that almost all the coolest visual effect on the web are created by it.
 However, three.js lacks a universal 3D particle system for visual effect.

three.quarks Particle Engine provide following features:

- Outstanding performance
- Highly customize
- A realtime editor to test and create visual effects [three.quarks-editor](https://github.com/Alchemist0823/three.quarks-editor)
- VFX json load and save 

three.quarks computes most particles information on CPU, and it uses customized shader
 and instancing technique to render those particles. three.quarks supports 1 dimension
 Bezier Curves for the best transform visual effect. Most importantly, developers can
 customize how the particle system works by adding their own Behavior.

three.quarks-editor can help you preview a set of particle system at once.
 and you can also adjust all the particle system at real time and export those system
  as a JSON file. Your app or game can load those JSON file later. It even includes a 
  Javascript scripting system to test those effect in a similar environment to your 
  application.

Note: Both libraries are still under heavy development, use it with your caution.

### Install
#### Package install
```bash
yarn install three.quarks
```

#### browser install

### Examples
Check [test](test) folder
Check [examples](examples) folder
More examples will come up later.
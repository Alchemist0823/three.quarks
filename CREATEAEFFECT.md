# Creating a effect

The goal of this section is to give a brief introduction to Quarks. We will start by setting up a scene, with a default particle system. A working example is provided at the bottom of the page in case you get stuck and need help.

## Before we start

If you haven't yet, go through the [Installation](https://threejs.org/docs/#manual/introduction/Installation) guide. We'll assume you've already set up the same project structure (including *index.html* and *main.js*), have installed three.js, and are either running a build tool, or using a local server with a CDN and import maps.

## Creating the scene

To actually be able to display anything with three.quarks, we need four things: scene, camera, renderer and quarks' batch renderer, so that we can render the effect in batch renderer.

*main.js ---*

```javascript
import  *  as THREE from  'three';
const scene =  new THREE.Scene();
const camera =  new THREE.PerspectiveCamera(  75, window.innerWidth / window.innerHeight,  0.1,  1000  ); 
const renderer =  new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
```

Let's take a moment to explain what's going on here. We have now set up the scene, our camera and the renderer.


*"That's all good, but where's that cube you promised?"* Let's add it now.

```javascript
import  *  as THREE from  'three';
import  *  as QUARKS from  'three.quarks';
const batchSystem = new QUARKS.BatchedParticleRenderer();
scene.add(batchSystem);
const loader = new QUARKS.QuarksLoader();
loader.setCrossOrigin("");
loader.load("./atom.json", batchSystem, (object3D)=>{
    particleSystems = object3D;
    scene.add(object3D);
}, ()=>{}, ()=>{});
 camera.position.z =  5;
 ```

To create a atom effect, we need a `QuarksLoader`. This loader is used to load the effect from a json file. after loading the effect, we need to add it to the scene.

By default, when we call `scene.add()`, the thing we add will be added to the coordinates `(0,0,0)`. This would cause both the camera and the cube to be inside each other. To avoid this, we simply move the camera out a bit.

### Rendering the scene

If you copied the code from above into the main.js file we created earlier, you wouldn't be able to see anything. This is because we're not actually rendering anything yet. For that, we need what's called a render or animation loop.

```javascript
function animate() 
{ 
    renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );
```

This will create a loop that causes the renderer to draw the scene every time the screen is refreshed (on a typical screen this means 60 times per second). If you're new to writing games in the browser, you might say *"why don't we just create a setInterval ?"* The thing is - we could, but `requestAnimationFrame` which is internally used in `WebGLRenderer` has a number of advantages. Perhaps the most important one is that it pauses when the user navigates to another browser tab, hence not wasting their precious processing power and battery life.

### Animating the effect

If you insert all the code above into the file you created before we began, you would still see nothing. Let's make it work by animating the effect.

Add the following code right above the `renderer.render` call in your `animate` function:

```javascript
batchSystem.update(deltaTime);
```

This will be run every frame (normally 60 times per second), and give the cube a nice rotation animation. Basically, anything you want to move or change while the app is running has to go through the animation loop. You can of course call other functions from there, so that you don't end up with an `animate` function that's hundreds of lines.

### The result

Congratulations! You have now completed your first three.js application. It's simple, but you have to start somewhere.

The full code is available below and as an editable [live example](https://jsfiddle.net/tswh48fL/). Play around with it to get a better understanding of how it works.

*index.html ---*

`<!DOCTYPE html>  <html  lang="en">  <head>  <meta  charset="utf-8">  <title>My first three.js app</title>  <style> body { margin:  0;  }  </style>  </head>  <body>  <script  type="module"  src="/main.js"></script>  </body>  </html>`

*main.js ---*

`import  *  as THREE from  'three';  const scene =  new THREE.Scene();  const camera =  new THREE.PerspectiveCamera(  75, window.innerWidth / window.innerHeight,  0.1,  1000  );  const renderer =  new THREE.WebGLRenderer(); renderer.setSize( window.innerWidth, window.innerHeight ); renderer.setAnimationLoop( animate ); document.body.appendChild( renderer.domElement );  const geometry =  new THREE.BoxGeometry(  1,  1,  1  );  const material =  new THREE.MeshBasicMaterial(  { color:  0x00ff00  }  );  const cube =  new THREE.Mesh( geometry, material ); scene.add( cube ); camera.position.z =  5;  function animate()  { cube.rotation.x +=  0.01; cube.rotation.y +=  0.01; renderer.render( scene, camera );  }`
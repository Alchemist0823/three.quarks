# Get Started

## Project Structure

- index.html

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>My first three.js app</title>
		<style>
			body { margin: 0; }
		</style>
	</head>
	<body>
		<script type="module" src="/main.js"></script>
	</body>
</html>
<script src="node_modules/three/build/three.js"></script>
<script src="node_modules/three.quarks/build/three.quarks.js"></script>
```

- main.js

```js
import * as THREE from 'three';
import * as Quarks from 'three.quarks';
```

## Option 1: Install via npm and a build tool

### Development
Installing from the [npm package registry](https://www.npmjs.com/package/three.quarks) and using a [build tool](https://webpack.js.org/) is the recommended 
approach for most users — the more dependencies your project needs, the more likely
 you are to run into problems that the static hosting cannot easily resolve. With a 
 build tool, importing local JavaScript files and npm packages should work out of
  the box, without import maps.

Install [Node.js](https://nodejs.org/en). We'll need it to load manage dependencies and to run our build tool.
Install [three.js](https://threejs.org/), [three.quarks](https://www.npmjs.com/package/three.quarks) and a build tool, [Vite](https://vitejs.dev/), using 
a terminal in your project folder. Vite will be used during development, but it isn't part of the final webpage.
 If you prefer to use another build tool, that's fine — we support modern build tools that 
 can import [ES Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules).

```bash
# three.js
npm install --save three

# vite
npm install --save-dev vite
```

Installation added node_modules/ and package.json to my project. What are they?
From your terminal, run:

```bash
npx vite
```

#### What is npx?

npx is installed with Node.js, and runs command line programs like Vite 
so that you don't have to search for the right file in node_modules/ yourself. 
If you prefer, you can put Vite's common commands into the package.json:scripts list, and use npm run dev instead.

If everything went well, you'll see a URL like http://localhost:5173 appear in your terminal, and can open that URL to see your web application.

The page will be blank — you're ready to create a scene.

If you want to learn more about these tools before you continue, see:

- [Vite](https://vitejs.dev/guide/)
- [Node.js](https://nodejs.org/en/docs/)

### Production
Later, when you're ready to deploy your web application, you'll just need to tell Vite to run a production build — npx vite build. Everything used by the application will be compiled, optimized, and copied into the dist/ folder. The contents of that folder are ready to be hosted on your website.

## Option 2: Install via CDN

### Development

Installing without build tools will require some changes to the project structure given above.

We imported code from 'three' (an npm package) in main.js, and web browsers don't know what that means. In index.html we'll need to add an [import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap) defining where to get the package. Put the code below inside the <head></head> tag, after the styles.

```html
<script type="importmap">
  {
    "imports": {
      "three": "https://cdn.jsdelivr.net/npm/three@<version>/build/three.module.js",
      "three/addons/": "https://cdn.jsdelivr.net/npm/three@<version>/examples/jsm/",
      "three.quarks": "https://cdn.jsdelivr.net/npm/three.quarks@<version>"
    }
  }
</script>
```
Don't forget to replace <version> with an actual version of three.js, like "v0.149.0". The most recent version can be found on the [npm version list](https://www.npmjs.com/package/three).

We'll also need to run a local server to host these files at URL where the web browser can access them. While it's technically possible to double-click an HTML file and open it in your browser, important features that we'll later implement, do not work when the page is opened this way, for security reasons.

Install [Node.js](https://nodejs.org/en), then run `serve` to start a local server in the project's directory:

```bash
npx serve .
```

If everything went well, you'll see a URL like http://localhost:3000 appear in your terminal, and can open that URL to see your web application.

The page will be blank — you're ready to create a scene.

Many other local static servers are available — some use different languages instead of Node.js, and others are desktop applications. They all work basically the same way, and we've provided a few alternatives below.

###Production

When you're ready to deploy your web application, push the source files to your web hosting provider — no need to build or compile anything. The downside of that tradeoff is that you'll need to be careful to keep the import map updated with any dependencies (and dependencies of dependencies!) that your application requires. If the CDN hosting your dependencies goes down temporarily, your website will stop working too.

IMPORTANT: Import all dependencies from the same version of three.js, and from the same CDN. Mixing files from different sources may cause duplicate code to be included, or even break the application in unexpected ways.


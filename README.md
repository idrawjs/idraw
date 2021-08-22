<h1 align="center">iDraw.js</h1>

<p align="center">iDraw.js is a simple JavaScript framework for Drawing on the web.</p>


<p align="center"><a href="https://idraw.js.org">idraw.js.org</a></p>


<p align="center">
  <a title="CI" href="https://github.com/idrawjs/idraw/actions/workflows/node.js.yml">
    <img src="https://github.com/idrawjs/idraw/actions/workflows/node.js.yml/badge.svg?branch=main" alt="CI">
  <a>

  <a href="https://www.npmjs.com/package/idraw">
    <img src="https://img.shields.io/npm/v/idraw.svg?sanitize=idraw" alt="Version">
  </a>
  <a href="https://www.npmjs.com/package/idraw">
    <img src="https://img.shields.io/npm/l/idraw.svg?sanitize=true" alt="License">
  </a>
</p>


<!-- [![Node.js CI](https://github.com/idrawjs/idraw/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/idrawjs/idraw/actions/workflows/node.js.yml) -->

<hr/>


- [Documents](https://idrawjs.github.io/docs/en/) | [中文文档](https://idrawjs.github.io/docs/zh/) 
- [Online Playground](https://idrawjs.github.io/playground/)
- [Online Studio](https://idrawjs.github.io/studio/)


## Install

```
npm i idraw
```
## Getting Started

```js
import iDraw from 'idraw';

const idraw = new iDraw(
  document.querySelector('#app'),
  {
    width: 600,
    height: 400,
    contextWidth: 600,
    contextHeight: 400,
    devicePixelRatio: 4,
  }
);
idraw.addElement({
  name: "rect-1",
  x: 140,
  y: 120,
  w: 200,
  h: 100,
  type: "rect",
  desc: {
    color: "#f7d3c1",
    borderRadius: 20,
    borderWidth: 4,
    borderColor: "#ff6032",
  },
});
```

## Contributing

We appreciate your help!

To contribute, please follow the steps:

- `git clone git@github.com:idrawjs/idraw.git`
- `cd idraw`
- `npm i`
- `npm run init`
- `npm run dev`  for compiling all packages
  -  `npm run dev ${module}` for compiling single module such as `idraw`
- `npm run serve` for starting a server 
- http://127.0.0.1:8080
  - http://127.0.0.1:8080/packages/idraw/examples/features/
  - http://127.0.0.1:8080/packages/core/examples/features/
  - http://127.0.0.1:8080/packages/board/examples/features/
# @idraw/renderer

[![Node.js CI](https://github.com/idrawjs/idraw/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/idrawjs/idraw/actions/workflows/node.js.yml)


## Usage

### Quick Start

```sh
npm i @idraw/renderer
```

```js
import Renderer from '@idraw/renderer';

const renderer = new Renderer({
  width: 600,
  height: 400,
  contextWidth: 600,
  contextHeight: 400,
  devicePixelRatio: 1,
});

const canvas = document.querySelector('canvas');
renderer.render(canvas, {
  elements: [
    {
      name: "rect-001",
      x: 10,
      y: 10,
      w: 200,
      h: 100,
      type: "rect",
      desc: {
        bgColor: "#f0f0f0",
        borderRadius: 20,
        borderWidth: 10,
        borderColor: "#bd0b64",
      },
    },
  ]
})

```

### Events

```js
renderer.on('load', (e) => {
  // ...
})
renderer.on('loadComplete', (e) => {
  // ...
})

renderer.on('drawFrame', (e) => {
  // ...
})
renderer.on('drawFrameComplete', (e) => {
  // ...
})
```

## Documents

- [Documents](https://idraw.js.org/docs/en/) | [中文文档](https://idraw.js.org/docs/zh/) 
- [Online Playground](https://idraw.js.org/playground/) | [在线API示例](https://idraw.js.org/playground/)
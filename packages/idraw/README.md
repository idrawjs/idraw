<h1 align="center">iDraw.js</h1>

<p align="center">iDraw.js is a simple JavaScript framework for Drawing on the web.</p>


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

- [Documents](https://idraw.js.org/docs/en/) | [中文文档](https://idraw.js.org/docs/zh/) 
- [Online Playground](https://idraw.js.org/playground/) | [在线API示例](https://idraw.js.org/playground/)
- [Online Studio](https://idraw.js.org/studio/) | [在线绘图演示](https://idraw.js.org/studio/)
 
## @idraw/studio Preview

The preview of `@idraw/studo`. Click [here](https://github.com/idrawjs/studio) to get it.

<div style="text-align: center">
  <img src="./assets/preview/idraw-studio-preview.png" width="700" />
</div>

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
    devicePixelRatio: 1,
  }
);
idraw.addElement({
  name: "rect-1",
  x: 140,
  y: 120,
  w: 200,
  h: 100,
  type: "rect",
  detail: {
    bgColor: "#f7d3c1",
    borderRadius: 20,
    borderWidth: 4,
    borderColor: "#ff6032",
  },
});
```

### React

```jsx
import iDraw from 'idraw';
import { useEffect, useRef } from 'react';

function Demo() {
  const ref = useRef(null);
  useEffect(() => {
    const idraw = new iDraw(ref.current, {
      width: 600,
      height: 400,
      contextWidth: 600,
      contextHeight: 400,
      devicePixelRatio: 1,
    });
    idraw.addElement({
      name: "rect-001",
      x: 140,
      y: 120,
      w: 200,
      h: 100,
      type: "rect",
      detail: {
        bgColor: "#f7d3c1",
        borderRadius: 20,
        borderWidth: 4,
        borderColor: "#ff6032",
      },
    })
  }, []);

  return (
    <div ref={ref}></div>
  )
}
```

### Vue

```html
<template>
  <div ref="mount"></div>
</template>

<script setup >
import iDraw from 'idraw';
import { ref, onMounted } from 'vue'
const mount = ref();

onMounted(() => {
  const idraw = new iDraw(mount.value, {
    width: 600,
    height: 400,
    contextWidth: 600,
    contextHeight: 400,
    devicePixelRatio: 1,
  });
  idraw.addElement({
    name: "rect-001",
    x: 140,
    y: 120,
    w: 200,
    h: 100,
    type: "rect",
    detail: {
      bgColor: "#f7d3c1",
      borderRadius: 20,
      borderWidth: 4,
      borderColor: "#ff6032",
    },
  })
})
</script>
```

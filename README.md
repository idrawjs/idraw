<h1 align="center">iDraw.js</h1>

<p align="center">iDraw.js is a simple JavaScript framework for Drawing on the web.</p>

<p align="center">一个面向Web绘图的JavaScript框架</p>


<p align="center"><a href="https://idraw.js.org">idraw.js.org</a></p>


<p align="center">

  <a title="CI" href="https://github.com/idrawjs/idraw/actions/workflows/node.js.yml">
    <img src="https://github.com/idrawjs/idraw/actions/workflows/node.js.yml/badge.svg?branch=main" alt="CI">
  <a>

  <!-- <a href="https://codecov.io/gh/idrawjs/idraw">
    <img src="https://codecov.io/gh/idrawjs/idraw/branch/main/graph/badge.svg?token=MICIC9SCKY"/>
  </a> -->
    
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
 

> Note:
> At present, the development content of the main branch is v0.4, and it is currently in the development and reconstruction stage, mainly based on the v0.3 version for optimization and reconstruction.
> The npm module is version v0.3. If you encounter any problems while using the npm module, you can view the content of this branch: [https://github.com/idrawjs/idraw/tree/v0.3](https://github.com/idrawjs/idraw/tree/v0.3)


> 注意:
> 当前`main`分支开发内容为`v0.4`，目前处于开发重构阶段，主要基于`v0.3`版本进行优化重构。
> 目前npm 模块是`v0.3 `版本。 如果你在使用npm模块的过程中遇到什么问题，可以查看这个分支的内容： [https://github.com/idrawjs/idraw/tree/v0.3](https://github.com/idrawjs/idraw/tree/v0.3)


## @idraw/studio Preview

The preview of `@idraw/studo`. Click [here](https://github.com/idrawjs/studio) to get it.

<div style="text-align: center">
  <img src="./assets/preview/idraw-studio-dark.png" width="700" />
</div>

<div style="text-align: center">
  <img src="./assets/preview/idraw-studio-light.png" width="700" />
</div>

## Install

```
npm i idraw
```

## Getting Started

### Common

```js
import iDraw from 'idraw';

const idraw = new iDraw(
  document.querySelector('#app'),
  {
    width: 600,
    height: 400,
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
    background: "#f7d3c1",
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
        background: "#f7d3c1",
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
      background: "#f7d3c1",
      borderRadius: 20,
      borderWidth: 4,
      borderColor: "#ff6032",
    },
  })
})
</script>
```


## Contributing

We appreciate your help!

To contribute, please follow the steps:

### Step 1: Prepare Project

- `git clone git@github.com:idrawjs/idraw.git`
- `cd idraw`
- `pnpm i`
- `npm run dev`

### Step 2: Development

- `npm run dev` to select and develop single package


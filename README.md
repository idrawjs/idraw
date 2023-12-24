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


<p align="center">
  <img width="200" src="https://github.com/idrawjs/idraw/assets/8216630/bcf8fbc6-6374-4cb9-a67f-1687d029a863" />
</p>


<!-- [![Node.js CI](https://github.com/idrawjs/idraw/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/idrawjs/idraw/actions/workflows/node.js.yml) -->

<hr/>


- [Documents](https://idraw.js.org/docs/en-US/) | [中文文档](https://idraw.js.org/docs/zh-CN/) 
- [Online Playground](https://idraw.js.org/playground/) | [在线API示例](https://idraw.js.org/playground/)
- [Online Studio](https://idraw.js.org/studio/) | [在线绘图演示](https://idraw.js.org/studio/)
 

## @idraw/studio Preview

The preview of `@idraw/studo`. Click [here](https://github.com/idrawjs/studio) to get it.

<p align="center">
  <img alt="idraw studio dark preview" src="https://github.com/idrawjs/studio/assets/8216630/62b9bc71-5fca-421d-9c6e-b7512edc77f2" width="700">
</p>

<p align="center">
  <img alt="idraw studio light preview" src="https://github.com/idrawjs/studio/assets/8216630/5b4cc1dc-89e1-4f67-84fa-578667d42bf7" width="700">
</p>

## Install

```
npm i idraw
```

## Getting Started

### Common

```js
import { iDraw } from 'idraw';

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
import { iDraw } from 'idraw';
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
import { iDraw } from 'idraw';
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


import type { Data, ElementAssets, Element } from '@idraw/types';
import { deepClone, getElemenetsAssetIds } from '@idraw/util';
import { figmaBytesToMap, figmaMapToIDrawData, figmaBytesToIDrawData } from '../src';
import { iDraw } from '../../idraw';
// import data from './data';

const url = new URLSearchParams(window.location.search);

async function action(params: { data: Data }) {
  const previewDOM = document.querySelector('#canvas-preview') as HTMLDivElement;

  const { data } = params;
  const devicePixelRatio = window.devicePixelRatio;
  const width = window.innerWidth;
  const height = 600;

  const data1 = deepClone(data);

  const idraw = new iDraw(previewDOM, {
    devicePixelRatio,
    width,
    height
  });
  idraw.setData(data1);
  idraw.centerContent();
}

// async function main() {
//   if (targetFile) {
//     const filePath = `/demo/lab-figma-to-elements/figma/${targetFile}`;
//     const figma = await fetch(filePath).then((res) => res.blob());
//     const buffer = await figma.arrayBuffer();

//     {
//       const filePath = `/demo/lab-figma-to-elements/figma/${targetFile}`;
//       const figma = await fetch(filePath).then((res) => res.blob());
//       const buff = await figma.arrayBuffer();
//       const bytes = new Uint8Array(buff);
//       const figmaMap = await figmaBytesToMap(bytes);
//       console.log('figmaMap ===== ', figmaMap);
//       const data = await figmaMapToIDrawData(figmaMap);
//       console.log('object ===== ', data);
//     }

//     let data = await figmaBufferToIDrawData(buffer);
//     // console.log('object ====== ', object);

//     // const map = figmaObjectToMap(object);
//     // console.log('map ==== ', map);

//     // const tree = figmaObjectToTree(object);
//     // console.log('tree ==== ', tree);

//     // let data = figmaObjectToIDrawData(object);
//     // TODO
//     data = {
//       elements: (data.elements[0] as Element<'group'>).detail.children
//     };
//     // console.log('data ===== ', data);
//     await action({ data });
//   } else {
//     list();
//   }
// }

async function main() {
  const filePath = `/dev/figma/iOS-Native-Wireframes-Community.fig`;
  console.log('filePath ------ ', filePath);
  const figma = await fetch(filePath).then((res) => res.blob());
  const arrayBuffer = await figma.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  let data: Data = await figmaBytesToIDrawData(buffer);
  // // TODO
  data = {
    elements: (data.elements[0] as Element<'group'>).detail.children,
    global: data.elements[0].global
  };

  console.log('data ===== ', data);
  await action({ data });
}

main()
  .then(() => {
    console.log('Ok');
  })
  .catch((err) => {
    console.log(err);
  });

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

async function main() {
  const filePath = `/dev/figma/iOS-Native-Wireframes-Community.fig`;
  const figma = await fetch(filePath).then((res) => res.blob());
  const arrayBuffer = await figma.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  let data: Data = await figmaBytesToIDrawData(buffer);

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

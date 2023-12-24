import { Renderer } from '@idraw/renderer';
import { Calculator } from '@idraw/board';
import { createOffscreenContext2D } from '@idraw/util';
import type { Data, LoadItemMap, ViewContext2D, ViewScaleInfo, ViewSizeInfo } from '@idraw/types';

export interface ExportImageFileBaseOptions {
  devicePixelRatio: number;
}

export type ExportImageFileOptions = ExportImageFileBaseOptions & {
  data: Data;
  width: number;
  height: number;
  loadItemMap: LoadItemMap;
  viewScaleInfo: ViewScaleInfo;
  viewSizeInfo: ViewSizeInfo;
};

export type ExportImageFileResult = {
  blobURL: string | null;
  width: number;
  height: number;
  devicePixelRatio: number;
};

export async function exportImageFileBlobURL(opts: ExportImageFileOptions): Promise<ExportImageFileResult> {
  const { data, width, height, devicePixelRatio, viewScaleInfo, viewSizeInfo, loadItemMap } = opts;
  let viewContext: ViewContext2D | null = createOffscreenContext2D({ width, height, devicePixelRatio });
  let calculator: Calculator | null = new Calculator({ viewContext });
  let renderer: Renderer | null = new Renderer({
    viewContext,
    calculator
  });
  renderer.setLoadItemMap(loadItemMap);
  renderer.drawData(data, {
    viewScaleInfo,
    viewSizeInfo,
    forceDrawAll: true
  });
  let blobURL: string | null = null;
  let offScreenCanvas = viewContext.$getOffscreenCanvas();
  if (offScreenCanvas) {
    const blob = await offScreenCanvas.convertToBlob();
    blobURL = window.URL.createObjectURL(blob);
  }

  offScreenCanvas = null;
  viewContext = null;
  calculator = null;
  renderer = null;

  return {
    blobURL,
    width,
    height,
    devicePixelRatio
  };
}

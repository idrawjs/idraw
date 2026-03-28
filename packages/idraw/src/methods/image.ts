import type { Data, ViewSizeInfo } from '@idraw/types';
import { Core } from '@idraw/core';
import { calcVisiableViewSize } from '@idraw/util';
import { IDrawEvent } from '../event';
import { exportImageFileBlobURL } from '../file';
import type { ExportImageFileBaseOptions, ExportImageFileResult } from '../file';

export async function getImageBlobURL(
  depOptions: { data: Data; viewSizeInfo: ViewSizeInfo; core: Core<IDrawEvent> },
  opts?: ExportImageFileBaseOptions
): Promise<ExportImageFileResult> {
  const { data, viewSizeInfo, core } = depOptions;
  const { devicePixelRatio } = opts || { devicePixelRatio: 1 };

  const outputSize = calcVisiableViewSize(data);

  return await exportImageFileBlobURL({
    width: outputSize.width,
    height: outputSize.height,
    devicePixelRatio,
    data,
    viewScaleInfo: { scale: 1, offsetLeft: -outputSize.x, offsetTop: -outputSize.y, offsetBottom: 0, offsetRight: 0 },
    viewSizeInfo: {
      ...viewSizeInfo,
      ...{ devicePixelRatio },
    },
    loadItemMap: core.getLoadItemMap(),
  });
}

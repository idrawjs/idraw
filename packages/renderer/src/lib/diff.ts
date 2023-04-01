import { DataElement, IDrawData, DataElemDesc } from '@idraw/types';

type DataElementMap = {
  [uuid: string]: DataElement<keyof DataElemDesc>;
};

export function isChangeImageElementResource(
  before: DataElement<'image'>,
  after: DataElement<'image'>
): boolean {
  return before?.desc?.src !== after?.desc?.src;
}

export function isChangeSVGElementResource(
  before: DataElement<'svg'>,
  after: DataElement<'svg'>
): boolean {
  return before?.desc?.svg !== after?.desc?.svg;
}

export function isChangeHTMLElementResource(
  before: DataElement<'html'>,
  after: DataElement<'html'>
): boolean {
  return (
    before?.desc?.html !== after?.desc?.html ||
    before?.desc?.width !== after?.desc?.width ||
    before?.desc?.height !== after?.desc?.height
  );
}

export function diffElementResourceChange(
  before: DataElement<keyof DataElemDesc>,
  after: DataElement<keyof DataElemDesc>
): string | null {
  let result = null;
  let isChange = false;
  switch (after.type) {
    case 'image': {
      isChange = isChangeImageElementResource(
        before as DataElement<'image'>,
        after as DataElement<'image'>
      );
      break;
    }
    case 'svg': {
      isChange = isChangeSVGElementResource(
        before as DataElement<'svg'>,
        after as DataElement<'svg'>
      );
      break;
    }
    case 'html': {
      isChange = isChangeHTMLElementResource(
        before as DataElement<'html'>,
        after as DataElement<'html'>
      );
      break;
    }
    default:
      break;
  }
  if (isChange === true) {
    result = after.uuid;
  }
  return result;
}

export function diffElementResourceChangeList(
  before: IDrawData,
  after: IDrawData
): string[] {
  const uuids: string[] = [];
  const beforeMap = parseDataElementMap(before);
  const afterMap = parseDataElementMap(after);
  for (const uuid in afterMap) {
    if (['image', 'svg', 'html'].includes(afterMap[uuid]?.type) !== true) {
      continue;
    }
    if (beforeMap[uuid]) {
      let isChange = false;
      switch (beforeMap[uuid].type) {
        case 'image': {
          isChange = isChangeImageElementResource(
            beforeMap[uuid] as DataElement<'image'>,
            afterMap[uuid] as DataElement<'image'>
          );
          break;
        }
        case 'svg': {
          isChange = isChangeSVGElementResource(
            beforeMap[uuid] as DataElement<'svg'>,
            afterMap[uuid] as DataElement<'svg'>
          );
          break;
        }
        case 'html': {
          isChange = isChangeHTMLElementResource(
            beforeMap[uuid] as DataElement<'html'>,
            afterMap[uuid] as DataElement<'html'>
          );
          break;
        }
        default:
          break;
      }
      if (isChange === true) {
        uuids.push(uuid);
      }
    } else {
      uuids.push(uuid);
    }
  }
  return uuids;
}

function parseDataElementMap(data: IDrawData): DataElementMap {
  const elemMap: DataElementMap = {};
  data.elements.forEach((elem) => {
    elemMap[elem.uuid] = elem;
  });
  return elemMap;
}

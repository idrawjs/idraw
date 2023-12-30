import type {
  // ViewScaleInfo,
  DefaultElementDetailConfig,
  ElementSize,
  ElementRectDetail,
  ElementCircleDetail,
  ElementTextDetail,
  ElementSVGDetail,
  ElementImageDetail,
  ElementGroupDetail
} from '@idraw/types';

export const defaultText = 'Text Element';

export function getDefaultElementDetailConfig(): DefaultElementDetailConfig {
  const config: DefaultElementDetailConfig = {
    boxSizing: 'border-box',
    borderWidth: 0,
    borderColor: '#000000',
    shadowColor: '#000000',
    borderRadius: 0,
    borderDash: [],
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 0,
    opacity: 1,
    color: '#000000',
    textAlign: 'left',
    verticalAlign: 'top',
    fontSize: 16,
    lineHeight: 20,
    fontFamily: 'sans-serif',
    fontWeight: 400,
    overflow: 'hidden'
  };
  return config;
}

export function getDefaultElementRectDetail(): ElementRectDetail {
  const detail: ElementRectDetail = {
    background: '#D9D9D9'
  };
  return detail;
}

export function getDefaultElementCircleDetail(): ElementCircleDetail {
  const detail: ElementCircleDetail = {
    background: '#D9D9D9',
    radius: 0
  };
  return detail;
}

export function getDefaultElementTextDetail(elementSize: ElementSize): ElementTextDetail {
  const detailConfig = getDefaultElementDetailConfig();
  // const scale = opts?.viewScaleInfo?.scale || 1;
  const detail: ElementTextDetail = {
    text: defaultText,
    color: detailConfig.color,
    fontFamily: detailConfig.fontFamily,
    fontWeight: detailConfig.fontWeight,
    lineHeight: elementSize.w / defaultText.length,
    fontSize: elementSize.w / defaultText.length,
    textAlign: 'center',
    verticalAlign: 'middle'
  };
  return detail;
}

export function getDefaultElementSVGDetail(): ElementSVGDetail {
  const detail: ElementSVGDetail = {
    svg: '<svg t="1701004189871" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"   width="200" height="200"><path d="M908.1 353.1l-253.9-36.9L540.7 86.1c-3.1-6.3-8.2-11.4-14.5-14.5-15.8-7.8-35-1.3-42.9 14.5L369.8 316.2l-253.9 36.9c-7 1-13.4 4.3-18.3 9.3-12.3 12.7-12.1 32.9 0.6 45.3l183.7 179.1-43.4 252.9c-1.2 6.9-0.1 14.1 3.2 20.3 8.2 15.6 27.6 21.7 43.2 13.4L512 754l227.1 119.4c6.2 3.3 13.4 4.4 20.3 3.2 17.4-3 29.1-19.5 26.1-36.9l-43.4-252.9 183.7-179.1c5-4.9 8.3-11.3 9.3-18.3 2.7-17.5-9.5-33.7-27-36.3zM664.8 561.6l36.1 210.3L512 672.7 323.1 772l36.1-210.3-152.8-149L417.6 382 512 190.7 606.4 382l211.2 30.7-152.8 148.9z"   fill="#2c2c2c"></path></svg>'
  };
  return detail;
}

export function getDefaultElementImageDetail(): ElementImageDetail {
  const detail: ElementImageDetail = {
    src: 'data:image/svg+xml;base64,PHN2ZyAgIHZpZXdCb3g9IjAgMCAxMDI0IDEwMjQiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiAgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiPjxwYXRoIGQ9Ik05MjggMTYwSDk2Yy0xNy43IDAtMzIgMTQuMy0zMiAzMnY2NDBjMCAxNy43IDE0LjMgMzIgMzIgMzJoODMyYzE3LjcgMCAzMi0xNC4zIDMyLTMyVjE5MmMwLTE3LjctMTQuMy0zMi0zMi0zMnogbS00MCA2MzJIMTM2di0zOS45bDEzOC41LTE2NC4zIDE1MC4xIDE3OEw2NTguMSA0ODkgODg4IDc2MS42Vjc5MnogbTAtMTI5LjhMNjY0LjIgMzk2LjhjLTMuMi0zLjgtOS0zLjgtMTIuMiAwTDQyNC42IDY2Ni40bC0xNDQtMTcwLjdjLTMuMi0zLjgtOS0zLjgtMTIuMiAwTDEzNiA2NTIuN1YyMzJoNzUydjQzMC4yeiIgIGZpbGw9IiM1MTUxNTEiPjwvcGF0aD48cGF0aCBkPSJNMzA0IDQ1NmM0OC42IDAgODgtMzkuNCA4OC04OHMtMzkuNC04OC04OC04OC04OCAzOS40LTg4IDg4IDM5LjQgODggODggODh6IG0wLTExNmMxNS41IDAgMjggMTIuNSAyOCAyOHMtMTIuNSAyOC0yOCAyOC0yOC0xMi41LTI4LTI4IDEyLjUtMjggMjgtMjh6IiAgZmlsbD0iIzUxNTE1MSI+PC9wYXRoPjwvc3ZnPg=='
  };
  return detail;
}

export function getDefaultElementGroupDetail(): ElementGroupDetail {
  const detail: ElementGroupDetail = {
    children: [],
    background: '#D9D9D9',
    overflow: 'hidden'
  };
  return detail;
}

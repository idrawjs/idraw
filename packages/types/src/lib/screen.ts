type ScreenData = {
  scale: number;
  scrollLeft: number;
  scrollTop: number;
  // selectedElementUUID: string | null;
};

type ScreenPosition = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

type ScreenSize = {
  x: number;
  y: number;
  w: number;
  h: number;
};

type ScreenContext = {
  size: ScreenSize;
  position: ScreenPosition;
};

export { ScreenData, ScreenPosition, ScreenSize, ScreenContext };

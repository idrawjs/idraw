import type { MaterialType } from '@idraw/types';

export type IDrawModeEventMap = {
  create: {
    type: Exclude<MaterialType, 'path' | 'foreignObject' | 'svgCode'>;
    afterCreated?: () => void;
  };
  select: void;
  'select-layout': void;
  drag: void;
  readonly: void;
  'create-path': void;
  'edit-path': { id: string };
};

export type IDrawMode = keyof IDrawModeEventMap;

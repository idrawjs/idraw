import type { Material, MaterialAssets, MaterialSize, MaterialGroupAttributes } from './material';

export type DataLayout = Pick<MaterialSize, 'x' | 'y' | 'width' | 'height'> &
  Pick<MaterialGroupAttributes, 'fill' | 'strokeWidth' | 'overflow' | 'stroke' | 'strokeDasharray' | 'cornerRadius'> & {
    operations?: {
      position?: 'absolute' | 'relative';
    };
  };

export interface DataGlobal {
  fill?: string;
}

export type Data = {
  name?: string;
  materials: Material[];
  assets?: MaterialAssets;
  layout?: DataLayout;
  global?: DataGlobal;
};

export type Matrix = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

export type ColorMatrix = Matrix;

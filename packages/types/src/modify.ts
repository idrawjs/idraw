import type { Material, MaterialPosition, MaterialOperations } from './material';
import type { DataGlobal } from './data';

export type ModifyMethod =
  | 'updateMaterial'
  | 'modifyMaterial'
  | 'deleteMaterial'
  | 'moveMaterial'
  | 'addMaterial'
  | 'resizeMaterial'
  | 'resizeMaterials'
  | 'modifyMaterials'
  | 'resizeLayout'
  | 'modifyLayout'
  | 'modifyGlobal';

export type ModifyType = ModifyMethod | 'undo' | 'redo' | 'unknown';

/**
 * FlattenMaterial
 For example:
 { 
    "x": 0,
    "y": 0,
    "w": 0,
    "h": 0,
    "attributes.color": "#FFFFFF",
    "attributes.strokeWidth[0]": 10,
    "attributes.strokeWidth[1]": 20,
    "attributes.strokeWidth[2]": 30,
    "attributes.strokeWidth[3]": 40,
  }
 */
export type FlattenMaterial = Record<string, string | number | undefined | null>;

/**
 * ModifiedLayoutAttributes
 For example:
 { 
    "x": 0,
    "y": 0,
    "w": 0,
    "h": 0,
    "attributes.color": "#FFFFFF",
    "attributes.strokeWidth[0]": 10,
    "attributes.strokeWidth[1]": 20,
    "attributes.strokeWidth[2]": 30,
    "attributes.strokeWidth[3]": 40,
  }
 */
export type FlattenLayout = Record<string, string | number | undefined | null>;

/**
 * FlattenGlobal
 For example:
 {  
    "background": "#FFFFFF", 
  }
 */
export type FlattenGlobal = Partial<DataGlobal>;

export type ModifiedMaterialOperations = Partial<MaterialOperations>;

export interface ModifyContentMap {
  updateMaterial: {
    method: 'updateMaterial';
    id: string;
    before: FlattenMaterial | null;
    after: FlattenMaterial | null;
  };
  modifyMaterial: {
    method: 'modifyMaterial';
    id: string;
    before: FlattenMaterial | null;
    after: FlattenMaterial | null;
  };
  addMaterial: {
    method: 'addMaterial';
    id: string;
    position: MaterialPosition;
    material: Material;
  };
  deleteMaterial: {
    method: 'deleteMaterial';
    id: string;
    position: MaterialPosition;
    material: Material | null;
  };
  moveMaterial: {
    method: 'moveMaterial';
    id: string;
    from: MaterialPosition;
    to: MaterialPosition;
  };
  resizeMaterial: {
    method: 'modifyMaterial';
    id: string;
    before: FlattenMaterial | null;
    after: FlattenMaterial | null;
  };
  resizeMaterials: {
    method: 'modifyMaterials';
    before: (FlattenLayout & { id: string })[];
    after: (FlattenLayout & { id: string })[];
  };
  resizeLayout: {
    method: 'modifyLayout';
    before: FlattenLayout;
    after: FlattenLayout;
  };
  modifyLayout: {
    method: 'modifyLayout';
    before: FlattenLayout | null;
    after: FlattenLayout | null;
  };
  modifyMaterials: {
    method: 'modifyMaterials';
    before: (FlattenLayout & { id: string })[];
    after: (FlattenLayout & { id: string })[];
  };
  modifyGlobal: {
    method: 'modifyGlobal';
    before: FlattenGlobal | null;
    after: FlattenGlobal | null;
  };
}

export interface ModifyRecordMap {
  updateMaterial: {
    type: 'updateMaterial';
    time: number;
    content: ModifyContentMap['updateMaterial'];
  };
  modifyMaterial: {
    type: 'modifyMaterial';
    time: number;
    content: ModifyContentMap['modifyMaterial'];
  };
  addMaterial: {
    type: 'addMaterial';
    time: number;
    content: ModifyContentMap['addMaterial'];
  };
  deleteMaterial: {
    type: 'deleteMaterial';
    time: number;
    content: ModifyContentMap['deleteMaterial'];
  };
  moveMaterial: {
    type: 'moveMaterial';
    time: number;
    content: ModifyContentMap['moveMaterial'];
  };
  resizeMaterial: {
    type: 'resizeMaterial';
    time: number;
    content: ModifyContentMap['modifyMaterial'];
  };
  resizeMaterials: {
    type: 'resizeMaterials';
    time: number;
    content: ModifyContentMap['modifyMaterials'];
  };
  modifyMaterials: {
    type: 'modifyMaterials';
    time: number;
    content: ModifyContentMap['modifyMaterials'];
  };
  resizeLayout: {
    type: 'resizeLayout';
    time: number;
    content: ModifyContentMap['resizeLayout'];
  };
  modifyLayout: {
    type: 'modifyLayout';
    time: number;
    content: ModifyContentMap['modifyLayout'];
  };
  modifyGlobal: {
    type: 'modifyGlobal';
    time: number;
    content: ModifyContentMap['modifyGlobal'];
  };
  undo: {
    type: 'undo';
    time: number;
    content: ModifyContentMap[ModifyMethod];
  };
  redo: {
    type: 'redo';
    time: number;
    content: ModifyContentMap[ModifyMethod];
  };
  unknown: {
    type: 'unknown';
    time: number;
    content: any;
  };
}

export type ModifyRecord<T extends ModifyType = ModifyType> = ModifyRecordMap[T];

import { keySelectedMaterialList, keyHoverMaterial, keyActionType, keyGroupQueue } from '../selector';
import type { DeepSelectorSharedStorage } from '../selector';

export type DeepInfoSharedStorage = Pick<
  DeepSelectorSharedStorage,
  typeof keySelectedMaterialList | typeof keyHoverMaterial | typeof keyActionType | typeof keyGroupQueue
>;

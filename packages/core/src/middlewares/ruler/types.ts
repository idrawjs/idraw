import { keySelectedMaterialList, keyActionType } from '../selector';
import type { DeepSelectorSharedStorage } from '../selector';

export type DeepRulerSharedStorage = Pick<
  DeepSelectorSharedStorage,
  typeof keySelectedMaterialList | typeof keyActionType
>;

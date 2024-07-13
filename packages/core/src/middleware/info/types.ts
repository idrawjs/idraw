import { keySelectedElementList, keyHoverElement, keyActionType, keyGroupQueue } from '../selector';
import type { DeepSelectorSharedStorage } from '../selector';

export type DeepInfoSharedStorage = Pick<
  DeepSelectorSharedStorage,
  typeof keySelectedElementList | typeof keyHoverElement | typeof keyActionType | typeof keyGroupQueue
>;

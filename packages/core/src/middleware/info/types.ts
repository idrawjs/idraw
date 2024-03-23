import { keySelectedElementList, keyActionType, keyGroupQueue } from '../selector';
import type { DeepSelectorSharedStorage } from '../selector';

export type DeepInfoSharedStorage = Pick<DeepSelectorSharedStorage, typeof keySelectedElementList | typeof keyActionType | typeof keyGroupQueue>;

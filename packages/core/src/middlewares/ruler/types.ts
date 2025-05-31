import { keySelectedElementList, keyActionType } from '../selector';
import type { DeepSelectorSharedStorage } from '../selector';

export type DeepRulerSharedStorage = Pick<DeepSelectorSharedStorage, typeof keySelectedElementList | typeof keyActionType>;

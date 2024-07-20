import { keySelectedElementList } from '../selector';
import type { DeepSelectorSharedStorage } from '../selector';

export type DeepPointerSharedStorage = Pick<DeepSelectorSharedStorage, typeof keySelectedElementList>;

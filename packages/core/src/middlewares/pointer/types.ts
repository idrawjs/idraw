import { keySelectedMaterialList } from '../selector';
import type { DeepSelectorSharedStorage } from '../selector';

export type DeepPointerSharedStorage = Pick<DeepSelectorSharedStorage, typeof keySelectedMaterialList>;

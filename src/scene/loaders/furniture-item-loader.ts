import type { Object3D } from 'three';
import { animateAppear } from '@/utils/animations';
import { tryDispose } from './try-dispose';

import type {
  LoadFurnitureOptions,
  LoadFurnitureResult,
} from '@/scene/types';

/**
 * Universal load wrapper: loading UI → await model → onLoaded → appear.
 * Returns `undefined` when cancelled after load (object is disposed).
 */
export async function loadFurnitureItem<T extends Object3D>({
  id,
  label,
  load,
  onLoaded,
  loading,
  appear = {},
  isCancelled = () => false,
}: LoadFurnitureOptions<T>): Promise<LoadFurnitureResult<T> | undefined> {
  loading?.start({ id, label });

  try {
    const object = await load();

    if (isCancelled()) {
      tryDispose(object);
      loading?.stop(id);

      return undefined;
    }

    await onLoaded?.(object);
    loading?.stop(id);

    if (!appear || Object.keys(appear).length === 0) {
      return {
        object,
        cancel: () => {},
        finished: Promise.resolve(),
      };
    }

    const animation = animateAppear(object, appear);

    return {
      object,
      cancel: animation.cancel,
      finished: animation.finished,
    };
  } catch (error) {
    loading?.stop(id);
    throw error;
  }
}

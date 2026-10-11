import type { Object3D } from 'three';
import { animateAppear } from '../animations';
import type { AppearAnimationOptions } from '../types';
import type { FurnitureLoadingState } from '../../furniture/types';

export type FurnitureLoadingNotifier = {
  start: (state: FurnitureLoadingState) => void;
  stop: (id: string) => void;
  clear: () => void;
};

export type LoadFurnitureResult<T extends Object3D> = {
  object: T;
  cancel: () => void;
  finished: Promise<void>;
};

export type LoadFurnitureObjectOptions<T extends Object3D> = {
  id: string;
  label: string;
  load: () => Promise<T>;
  /** Place / configure the object before appear runs. */
  onLoaded?: (object: T) => void | Promise<void>;
  loading?: FurnitureLoadingNotifier;
  appear?: AppearAnimationOptions | false;
  isCancelled?: () => boolean;
};

function tryDispose(object: Object3D): void {
  const disposable = object as Object3D & { dispose?: () => void };

  disposable.dispose?.();
}

/** Tracks concurrent furniture loads and emits the first active state. */
export function createFurnitureLoadingNotifier(
  onChange?: (state: FurnitureLoadingState | null) => void,
): FurnitureLoadingNotifier {
  const active = new Map<string, FurnitureLoadingState>();

  const emit = () => {
    const next = active.values().next();

    onChange?.(next.done ? null : next.value);
  };

  return {
    start(state) {
      active.set(state.id, state);
      emit();
    },
    stop(id) {
      active.delete(id);
      emit();
    },
    clear() {
      active.clear();
      emit();
    },
  };
}

/**
 * Universal load wrapper: loading UI → await model → onLoaded → appear.
 * Returns `null` when cancelled after load (object is disposed).
 */
export async function loadFurnitureObject<T extends Object3D>({
  id,
  label,
  load,
  onLoaded,
  loading,
  appear = {},
  isCancelled = () => false,
}: LoadFurnitureObjectOptions<T>): Promise<LoadFurnitureResult<T> | null> {
  loading?.start({ id, label });

  try {
    const object = await load();

    if (isCancelled()) {
      tryDispose(object);
      loading?.stop(id);

      return null;
    }

    await onLoaded?.(object);
    loading?.stop(id);

    if (appear === false) {
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

export type { FurnitureLoadingState } from '../../furniture/types';

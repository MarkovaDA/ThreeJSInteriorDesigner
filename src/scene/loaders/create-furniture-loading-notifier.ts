import type { FurnitureLoadingState } from '@/furniture/types';
import type { FurnitureLoadingNotifier } from '@/scene/types';

/** Tracks concurrent furniture loads and emits the first active state. */
export function createFurnitureLoadingNotifier(
  onChange?: (state?: FurnitureLoadingState) => void,
): FurnitureLoadingNotifier {
  const active = new Map<string, FurnitureLoadingState>();

  /** Pushes the oldest active load (or `undefined`) to `onChange`. */
  const emit = () => {
    const next = active.values().next();

    onChange?.(next.done ? undefined : next.value);
  };

  return {
    /** Registers a load and notifies UI that something is loading. */
    start(state) {
      active.set(state.id, state);
      emit();
    },
    /** Removes a finished/cancelled load and refreshes UI state. */
    stop(id) {
      active.delete(id);
      emit();
    },
    /** Drops all tracked loads (e.g. on scene unmount). */
    clear() {
      active.clear();
      emit();
    },
  };
}

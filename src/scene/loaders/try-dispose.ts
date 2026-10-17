import type { Object3D } from 'three';

/** Calls `dispose()` when the object supports it. */
export function tryDispose(object: Object3D): void {
  const disposable = object as Object3D & { dispose?: () => void };

  disposable.dispose?.();
}

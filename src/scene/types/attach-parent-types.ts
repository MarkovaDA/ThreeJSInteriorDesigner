import type { Object3D } from 'three';

/** Scene object that can receive children via `add` (e.g. cornice for curtains). */
export type AttachParent = Object3D & {
  add(object: Object3D): Object3D;
};

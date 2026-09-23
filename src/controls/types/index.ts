import type { Vector3 } from 'three';

export type ControlsOptions = {
  target?: Vector3;
  minDistance?: number;
  maxDistance?: number;
  dampingFactor?: number;
};

import type { Object3D } from 'three';

export type SelectionHaloOptions = {
  /** Extra radius beyond the object footprint, in meters. */
  padding?: number;
  /** Ring / glow color as a hex number. */
  color?: number;
  /** Overall opacity of the halo, 0..1. */
  opacity?: number;
};

/**
 * Abstract selection indicator: a circle / aureole around a chosen object.
 * Concrete implementations may use a floor ring, outline pass, sprite, etc.
 */
export interface SelectionHalo {
  /** Object currently highlighted, if any. */
  readonly target: Object3D | null;

  /** Show the halo around `target` (replaces any previous attachment). */
  attach(target: Object3D, options?: SelectionHaloOptions): void;

  /** Hide the halo and detach from the current target. */
  clear(): void;

  /** Refresh halo size / pose after the target moves, scales, or rotates. */
  update(): void;
}

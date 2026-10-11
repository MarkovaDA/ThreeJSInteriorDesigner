import type { Object3D, Vector3 } from 'three';

export type ModelZoomFitOptions = {
  /** Extra framing margin as a distance multiplier. */
  padding?: number;
};

export type HomePose = {
  position: Vector3;
  target: Vector3;
};

/**
 * Abstract zoom API for framing / approaching a 3D model.
 * Concrete implementations may use orbit controls, a free camera, etc.
 */
export interface ModelZoom {
  /** Frame an object in view (update look-at target + camera distance). */
  fitToObject(object: Object3D, options?: ModelZoomFitOptions): void;

  /**
   * Zoom along the view axis relative to the current target.
   * `factor < 1` zooms in, `factor > 1` zooms out.
   */
  zoomBy(factor: number): void;

  /** Restore the pose captured by `saveHome()`. */
  reset(): void;

  /** Store the current camera / target pose as the home framing. */
  saveHome(): void;
}

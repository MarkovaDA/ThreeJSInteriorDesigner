export type Vec3 = [number, number, number];

export type CameraOptions = {
  aspect?: number;
  fov?: number;
  near?: number;
  far?: number;
  position?: Vec3;
};

export type { HomePose, ModelZoom, ModelZoomFitOptions } from './zoom';


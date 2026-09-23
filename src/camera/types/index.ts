export type Vec3 = [number, number, number];

export type CameraOptions = {
  aspect?: number;
  fov?: number;
  near?: number;
  far?: number;
  position?: Vec3;
};

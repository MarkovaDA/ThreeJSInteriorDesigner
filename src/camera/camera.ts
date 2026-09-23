import * as THREE from 'three';
import type { CameraOptions, Vec3 } from './types';

export class Camera extends THREE.PerspectiveCamera {
  constructor({
    aspect = 1,
    fov = 50,
    near = 0.1,
    far = 100,
    position = [5, 3.5, 6] as Vec3,
  }: CameraOptions = {}) {
    super(fov, aspect, near, far);

    this.position.set(...position);
    this.name = 'Camera';
  }

  resize(width: number, height: number): void {
    this.aspect = width / height;
    this.updateProjectionMatrix();
  }
}

export type { CameraOptions } from './types';

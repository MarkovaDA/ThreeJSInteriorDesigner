import type { Camera } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { ControlsOptions } from './types';

export class Controls extends OrbitControls {
  constructor(
    camera: Camera,
    domElement: HTMLElement,
    {
      target,
      minDistance = 2,
      maxDistance = 16,
      dampingFactor = 0.06,
    }: ControlsOptions = {},
  ) {
    super(camera, domElement);

    this.enableDamping = true;
    this.dampingFactor = dampingFactor;
    this.minDistance = minDistance;
    this.maxDistance = maxDistance;

    if (target) {
      this.target.copy(target);
    }

    this.update();
  }
}

export type { ControlsOptions } from './types';

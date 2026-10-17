import {
  Box3,
  PerspectiveCamera,
  Vector3,
  type Object3D,
} from 'three';

import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { HomePose, ModelZoom, ModelZoomFitOptions } from '../types';

/**
 * {@link ModelZoom} backed by a perspective camera + orbit controls.
 */
export class OrbitModelZoom implements ModelZoom {
  #camera: PerspectiveCamera;
  #controls: OrbitControls;
  #home?: HomePose;

  #box = new Box3();
  #size = new Vector3();
  #center = new Vector3();
  #offset = new Vector3();
  #direction = new Vector3();

  constructor(camera: PerspectiveCamera, controls: OrbitControls) {
    this.#camera = camera;
    this.#controls = controls;
  }

  fitToObject(object: Object3D, { padding = 1.35 }: ModelZoomFitOptions = {}): void {
    this.#box.setFromObject(object);

    if (this.#box.isEmpty()) {
      return;
    }

    this.#box.getSize(this.#size);
    this.#box.getCenter(this.#center);

    const radius = Math.max(this.#size.length() * 0.5, 0.05);
    const fov = (this.#camera.fov * Math.PI) / 180;
    const distance = (radius / Math.sin(fov / 2)) * padding;

    this.#controls.target.copy(this.#center);

    this.#direction
      .subVectors(this.#camera.position, this.#controls.target)
      .normalize();

    if (this.#direction.lengthSq() < 1e-6) {
      this.#direction.set(0, 0.35, 1).normalize();
    }

    const clamped = this.#clampDistance(distance);

    this.#camera.position
      .copy(this.#controls.target)
      .addScaledVector(this.#direction, clamped);

    this.#controls.update();
  }

  zoomBy(factor: number): void {
    if (!Number.isFinite(factor) || factor <= 0) {
      return;
    }

    this.#offset.subVectors(this.#camera.position, this.#controls.target);

    const current = this.#offset.length();

    if (current < 1e-5) {
      return;
    }

    this.#offset.setLength(this.#clampDistance(current * factor));
    this.#camera.position.copy(this.#controls.target).add(this.#offset);
    this.#controls.update();
  }

  reset(): void {
    if (!this.#home) {
      return;
    }

    this.#camera.position.copy(this.#home.position);
    this.#controls.target.copy(this.#home.target);
    this.#controls.update();
  }

  saveHome(): void {
    this.#home = {
      position: this.#camera.position.clone(),
      target: this.#controls.target.clone(),
    };
  }

  #clampDistance(distance: number): number {
    const min = this.#controls.minDistance;
    const max = this.#controls.maxDistance;

    return Math.min(max, Math.max(min, distance));
  }
}

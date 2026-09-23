import * as THREE from 'three';
import type { LightingOptions, Vec3 } from './types';

export class Lighting extends THREE.Group {
  readonly ambient: THREE.AmbientLight;
  readonly hemisphere: THREE.HemisphereLight;
  readonly sun: THREE.DirectionalLight;
  readonly fill: THREE.PointLight;

  constructor({
    ambient = {},
    hemisphere = {},
    sun = {},
    fill = {},
  }: LightingOptions = {}) {
    super();
    this.name = 'Lighting';

    this.ambient = new THREE.AmbientLight(
      ambient.color ?? 0xfff6ee,
      ambient.intensity ?? 0.55,
    );

    this.hemisphere = new THREE.HemisphereLight(
      hemisphere.skyColor ?? 0xe8f0ff,
      hemisphere.groundColor ?? 0xc4a882,
      hemisphere.intensity ?? 0.4,
    );

    this.sun = new THREE.DirectionalLight(
      sun.color ?? 0xfff2dd,
      sun.intensity ?? 1.2,
    );
    this.sun.position.set(...(sun.position ?? ([4, 8, 5] as Vec3)));
    this.sun.castShadow = sun.castShadow ?? true;

    const shadowMapSize = sun.shadowMapSize ?? 2048;
    const shadowSize = sun.shadowSize ?? 10;

    this.sun.shadow.mapSize.set(shadowMapSize, shadowMapSize);
    this.sun.shadow.camera.near = 0.5;
    this.sun.shadow.camera.far = 30;
    this.sun.shadow.camera.left = -shadowSize;
    this.sun.shadow.camera.right = shadowSize;
    this.sun.shadow.camera.top = shadowSize;
    this.sun.shadow.camera.bottom = -shadowSize;
    this.sun.shadow.bias = -0.0003;

    this.fill = new THREE.PointLight(
      fill.color ?? 0xffe8d0,
      fill.intensity ?? 12,
      fill.distance ?? 14,
      fill.decay ?? 2,
    );

    this.fill.position.set(...(fill.position ?? ([-2, 2.5, 2] as Vec3)));

    this.add(this.ambient, this.hemisphere, this.sun, this.fill);
  }
}

export type {
  AmbientLightOptions,
  FillLightOptions,
  HemisphereLightOptions,
  LightingOptions,
  SunLightOptions,
} from './types';

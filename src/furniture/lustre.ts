import {
  Box3,
  Group,
  Mesh,
  Object3D,
  Vector3,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { LustreOptions } from './types';

const DEFAULT_MODEL = 'red_cuisine.glb';

function resolveModelUrl(model: string): string {
  const fileName = model.endsWith('.glb') ? model : `${model}.glb`;

  return `${import.meta.env.BASE_URL}furniture/lustre/${fileName}`;
}

export class Lustre extends Group {
  private constructor() {
    super();
    this.name = 'Lustre';
  }

  static async load({
    model = DEFAULT_MODEL,
    targetWidth = 0.9,
  }: LustreOptions = {}): Promise<Lustre> {
    const lustre = new Lustre();
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(resolveModelUrl(model));
    const root = gltf.scene;

    root.name = model.replace(/\.glb$/i, '');
    lustre.add(root);

    root.traverse((object: Object3D) => {
      if (!(object instanceof Mesh)) {
        return;
      }

      object.castShadow = true;
      object.receiveShadow = true;
      object.frustumCulled = false;
    });

    lustre.#normalize(targetWidth);

    return lustre;
  }

  /** Scale to target width, center on XZ, put the top mount at local y = 0. */
  #normalize(targetWidth: number): void {
    const box = new Box3().setFromObject(this);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());

    this.children.forEach((child) => {
      child.position.x -= center.x;
      child.position.y -= center.y;
      child.position.z -= center.z;
    });

    const horizontal = Math.max(size.x, size.z);

    if (horizontal > 0.001) {
      this.scale.setScalar(targetWidth / horizontal);
    }

    this.updateMatrixWorld(true);

    const fitted = new Box3().setFromObject(this);

    this.children.forEach((child) => {
      child.position.y -= fitted.max.y / this.scale.y;
    });
  }

  /** Hang so the top of the model sits just under the ceiling. */
  hangFromCeiling({
    x = 0,
    z = 0,
    ceilingY,
    gap = 0.02,
  }: {
    x?: number;
    z?: number;
    ceilingY: number;
    gap?: number;
  }): void {
    this.position.set(x, ceilingY - gap, z);
    this.updateMatrixWorld(true);

    const box = new Box3().setFromObject(this);

    this.position.y += ceilingY - gap - box.max.y;
  }

  dispose(): void {
    this.traverse((object) => {
      if (!(object instanceof Mesh)) {
        return;
      }

      object.geometry?.dispose();

      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      materials.forEach((material) => {
        material?.dispose();
      });
    });
  }
}

export type { LustreOptions } from './types';

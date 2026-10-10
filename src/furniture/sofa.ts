import {
  Box3,
  Group,
  Mesh,
  Object3D,
  Vector3,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { SofaOptions } from './types';

export const DEFAULT_SOFA_MODEL = 'sofa_grey.glb';
const SOFA_DIR = `${import.meta.env.BASE_URL}furniture/sofa/`;

function resolveModelUrl(model?: string): string {
  const file = model?.trim()
    ? model.endsWith('.glb')
      ? model
      : `${model}.glb`
    : DEFAULT_SOFA_MODEL;

  return `${SOFA_DIR}${file}`;
}

export class Sofa extends Group {
  private constructor() {
    super();
    this.name = 'sofa.ru';
  }

  static async load({
    model,
    targetWidth = 2.2,
  }: SofaOptions = {}): Promise<Sofa> {
    const sofa = new Sofa();
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(resolveModelUrl(model));
    const root = gltf.scene;

    root.name = 'sofa.ru';
    sofa.add(root);

    root.traverse((object: Object3D) => {
      if (!(object instanceof Mesh)) {
        return;
      }

      object.castShadow = true;
      object.receiveShadow = true;
      object.frustumCulled = false;
    });

    sofa.#normalize(targetWidth);

    return sofa;
  }

  /** Scale to target width, center on XZ, put bottom at local y = 0. */
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
      child.position.y -= fitted.min.y / this.scale.y;
    });
  }

  /** Put the bottom of the model on the given world/local floor Y. */
  placeOnFloor(floorY: number): void {
    this.updateMatrixWorld(true);

    const box = new Box3().setFromObject(this);
    this.position.y += floorY - box.min.y;
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

export type { SofaOptions } from './types';

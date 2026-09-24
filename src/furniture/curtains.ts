import {
  Box3,
  DoubleSide,
  Group,
  Material,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Vector3,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export type CurtainsOptions = {
  /** Target width across the window, in meters. */
  targetWidth?: number;
  /** Soft fabric color applied to UV-unwrapped meshes without textures. */
  fabricColor?: number;
  fabricRoughness?: number;
};

const MODEL_URL = `${import.meta.env.BASE_URL}furniture/victorian_curtain.glb`;

export class Curtains extends Group {
  #disposables: Material[] = [];

  private constructor() {
    super();
    this.name = 'Curtains';
  }

  static async load({
    targetWidth = 3.2,
    fabricColor = 0x7a4a5c,
    fabricRoughness = 0.85,
  }: CurtainsOptions = {}): Promise<Curtains> {
    const curtains = new Curtains();
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(MODEL_URL);
    const root = gltf.scene;

    root.name = 'VictorianCurtain';
    curtains.add(root);

    const fabricMat = new MeshStandardMaterial({
      color: fabricColor,
      roughness: fabricRoughness,
      metalness: 0.02,
      side: DoubleSide,
    });
    curtains.#disposables.push(fabricMat);

    root.traverse((object: Object3D) => {
      if (!(object instanceof Mesh)) {
        return;
      }

      object.castShadow = true;
      object.receiveShadow = true;
      // Draw above window sky/glass so fabric covers the panes.
      object.renderOrder = 3;

      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      const hasMap = materials.some(
        (material) =>
          material instanceof MeshStandardMaterial && Boolean(material.map),
      );

      if (!hasMap) {
        object.material = fabricMat;
      }
    });

    curtains.#fitToWidth(targetWidth);

    return curtains;
  }

  #fitToWidth(targetWidth: number): void {
    const size = new Box3().setFromObject(this).getSize(new Vector3());
    const horizontal = Math.max(size.x, size.z);

    if (horizontal <= 0.001) {
      return;
    }

    const scale = targetWidth / horizontal;
    this.scale.setScalar(scale);
  }

  /** Hang so the top of the fabric sits just under a rod at local y = 0. */
  hangFromRod({
    x = 0,
    z = 0.08,
    gap = 0.02,
  }: {
    x?: number;
    z?: number;
    gap?: number;
  } = {}): void {
    this.position.set(x, 0, z);

    const box = new Box3().setFromObject(this);
    this.position.y -= box.max.y + gap;
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
        if (material && !this.#disposables.includes(material)) {
          material.dispose();
        }
      });
    });

    this.#disposables.forEach((material) => material.dispose());
    this.#disposables.length = 0;
  }
}

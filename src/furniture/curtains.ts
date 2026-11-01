import {
  DoubleSide,
  Mesh,
  MeshStandardMaterial,
  Object3D,
} from 'three';
import { Furniture } from './furniture';
import type { CurtainsOptions } from './types';

const MODEL_URL = `${import.meta.env.BASE_URL}furniture/curtains/victorian_curtain.glb`;

export class Curtains extends Furniture {
  private constructor() {
    super('Curtains');
  }

  static async load({
    targetWidth = 3.2,
    fabricColor = 0x7a4a5c,
    fabricRoughness = 0.85,
  }: CurtainsOptions = {}): Promise<Curtains> {
    const curtains = new Curtains();

    const fabricMat = new MeshStandardMaterial({
      color: fabricColor,
      roughness: fabricRoughness,
      metalness: 0.02,
      side: DoubleSide,
    });

    await curtains.attachGltfModel({
      url: MODEL_URL,
      rootName: 'VictorianCurtain',
      targetWidth,
      normalize: 'width',
      prepareRoot: (root) => {
        curtains.enableMeshShadows(root);
        // Draw above window sky/glass so fabric covers the panes.
        curtains.setMeshesRenderOrder(3, root);
        curtains.#applyFabricMaterial(root, fabricMat);
      },
    });

    return curtains;
  }

  #applyFabricMaterial(root: Object3D, fabricMat: MeshStandardMaterial): void {
    root.traverse((object: Object3D) => {
      if (!(object instanceof Mesh)) {
        return;
      }

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
    this.hangUnder({ x, z, y: 0, gap });
  }
}

export type { CurtainsOptions } from './types';

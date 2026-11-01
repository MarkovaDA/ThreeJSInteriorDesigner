import {
  Box3,
  Group,
  Material,
  Mesh,
  Object3D,
  Vector3,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/** Shared contract for every furniture piece in the scene. */
export interface IFurniture {
  dispose(): void;
  placeOnFloor(floorY: number): void;
}

export type FurnitureNormalizeMode = 'floor' | 'ceiling' | 'width';

export type AttachGltfOptions = {
  url: string;
  rootName?: string;
  targetWidth: number;
  normalize: FurnitureNormalizeMode;
  /** Defaults to enabling cast/receive shadows on every mesh. */
  prepareRoot?: (root: Object3D) => void;
};

export type HangUnderOptions = {
  x?: number;
  z?: number;
  /** World/local Y that the top of the model should sit just under. */
  y: number;
  gap?: number;
};

/**
 * Base for all furniture `Group`s.
 * Floor pieces use {@link placeOnFloor} / {@link normalizeToFloor};
 * hanging pieces use {@link normalizeToCeiling} and {@link hangUnder}.
 */
export abstract class Furniture extends Group implements IFurniture {
  protected constructor(name: string) {
    super();
    this.name = name;
  }

  /**
   * Load a GLB, attach it, optionally prepare meshes, then normalize size/origin.
   * Shared by sofa / table / lamp / lustre / curtains loaders.
   */
  protected async attachGltfModel({
    url,
    rootName,
    targetWidth,
    normalize,
    prepareRoot,
  }: AttachGltfOptions): Promise<Object3D> {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(url);
    const root = gltf.scene;

    if (rootName) {
      root.name = rootName;
    }

    this.add(root);

    if (prepareRoot) {
      prepareRoot(root);
    } else {
      this.enableMeshShadows(root);
    }

    switch (normalize) {
      case 'floor':
        this.normalizeToFloor(targetWidth);
        break;
      case 'ceiling':
        this.normalizeToCeiling(targetWidth);
        break;
      case 'width':
        this.scaleToHorizontalWidth(targetWidth);
        break;
    }

    return root;
  }

  /** Enable shadows on every mesh under a loaded GLTF root. */
  protected enableMeshShadows(root: Object3D): void {
    root.traverse((object: Object3D) => {
      if (!(object instanceof Mesh)) {
        return;
      }

      object.castShadow = true;
      object.receiveShadow = true;
      object.frustumCulled = false;
    });
  }

  /** Set `renderOrder` on every mesh under `root` (or this). */
  protected setMeshesRenderOrder(order: number, root: Object3D = this): void {
    root.traverse((object) => {
      if (object instanceof Mesh) {
        object.renderOrder = order;
      }
    });
  }

  /**
   * Center on XZ and scale so the longest horizontal axis matches `targetWidth`.
   * Returns the fitted world AABB after scaling.
   */
  protected fitHorizontalWidth(targetWidth: number): Box3 {
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

    return new Box3().setFromObject(this);
  }

  /** Scale only (no centering) so the longest horizontal axis matches `targetWidth`. */
  protected scaleToHorizontalWidth(targetWidth: number): void {
    const size = new Box3().setFromObject(this).getSize(new Vector3());
    const horizontal = Math.max(size.x, size.z);

    if (horizontal <= 0.001) {
      return;
    }

    this.scale.setScalar(targetWidth / horizontal);
  }

  /** Scale to target width, center on XZ, put bottom at local y = 0. */
  protected normalizeToFloor(targetWidth: number): void {
    const fitted = this.fitHorizontalWidth(targetWidth);

    this.children.forEach((child) => {
      child.position.y -= fitted.min.y / this.scale.y;
    });
  }

  /** Scale to target width, center on XZ, put the top mount at local y = 0. */
  protected normalizeToCeiling(targetWidth: number): void {
    const fitted = this.fitHorizontalWidth(targetWidth);

    this.children.forEach((child) => {
      child.position.y -= fitted.max.y / this.scale.y;
    });
  }

  /** Put the bottom of the model on the given world/local floor Y. */
  placeOnFloor(floorY: number): void {
    this.updateMatrixWorld(true);

    const box = new Box3().setFromObject(this);

    this.position.y += floorY - box.min.y;
  }

  /** Align the top of the AABB just under `y` (ceiling, rod, etc.). */
  hangUnder({ x, z, y, gap = 0.02 }: HangUnderOptions): void {
    this.position.set(
      x ?? this.position.x,
      y - gap,
      z ?? this.position.z,
    );
    this.updateMatrixWorld(true);

    const box = new Box3().setFromObject(this);

    this.position.y += y - gap - box.max.y;
  }

  dispose(): void {
    const disposed = new Set<Material | { dispose(): void }>();

    this.traverse((object) => {
      if (!(object instanceof Mesh)) {
        return;
      }

      object.geometry?.dispose();

      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      materials.forEach((material) => {
        if (!material || disposed.has(material)) {
          return;
        }

        material.dispose();
        disposed.add(material);
      });
    });
  }
}

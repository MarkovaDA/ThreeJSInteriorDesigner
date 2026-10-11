import {
  BackSide,
  BoxGeometry,
  BufferGeometry,
  Material,
  Mesh,
  MeshStandardMaterial,
  Texture,
  Vector3,
} from 'three';
import { createFloorTexture } from './floor-texture';
import type { RoomOptions } from './types';

export class Room extends Mesh {
  readonly width: number;
  readonly height: number;
  readonly depth: number;

  wallMat: MeshStandardMaterial;
  floorMat: MeshStandardMaterial;
  ceilingMat: MeshStandardMaterial;

  #disposables: Array<BufferGeometry | Material | Texture> = [];

  constructor({
    width = 8,
    height = 3.2,
    depth = 8,
    floorTexture = 'herringbone',
  }: RoomOptions = {}) {
    const wallMat = new MeshStandardMaterial({
      color: 0xf0ebe4,
      roughness: 0.9,
      side: BackSide,
    });

    const floorMap = createFloorTexture({
      kind: floorTexture,
      width,
      depth,
    });

    const floorMat = new MeshStandardMaterial({
      map: floorMap,
      color: 0xffffff,
      roughness: 0.78,
      metalness: 0.02,
      side: BackSide,
    });

    const ceilingMat = new MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.72,
      metalness: 0,
      emissive: 0xffffff,
      emissiveIntensity: 0.28,
      side: BackSide,
    });

    // Порядок граней BoxGeometry: +x, -x, +y, -y, +z, -z
    const materials = [
      wallMat, // right
      wallMat, // left
      ceilingMat, // top
      floorMat, // bottom
      wallMat, // front
      wallMat, // back
    ];

    const geometry = new BoxGeometry(width, height, depth);

    super(geometry, materials);

    this.wallMat = wallMat;
    this.floorMat = floorMat;
    this.ceilingMat = ceilingMat;

    this.width = width;
    this.height = height;
    this.depth = depth;

    this.position.y = height / 2;
    this.receiveShadow = true;
    this.name = 'Room';

    this.#disposables.push(
      geometry,
      this.wallMat,
      this.floorMat,
      this.ceilingMat,
      floorMap,
    );
  }

  get center(): Vector3 {
    return new Vector3(0, this.height / 2, 0);
  }

  dispose(): void {
    this.#disposables.forEach((item) => item.dispose());
    this.#disposables.length = 0;
  }
}

export type { RoomOptions } from './types';

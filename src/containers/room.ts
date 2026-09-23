import * as THREE from 'three';
import {
  BoxGeometry,
  MeshStandardMaterial,
  Material,
  BufferGeometry,
  Vector3,
} from 'three';
import type { RoomOptions } from './types';

export class Room extends THREE.Mesh {
  readonly width: number;
  readonly height: number;
  readonly depth: number;

  wallMat: MeshStandardMaterial;
  floorMat: MeshStandardMaterial;
  ceilingMat: MeshStandardMaterial;

  #disposables: Array<BufferGeometry | Material> = [];

  constructor({ width = 8, height = 3.2, depth = 8 }: RoomOptions = {}) {
    const wallMat = new MeshStandardMaterial({
      color: 0xf0ebe4,
      roughness: 0.9,
      side: THREE.BackSide,
    });

    const floorMat = new MeshStandardMaterial({
      color: 0xb8956c,
      roughness: 0.8,
      side: THREE.BackSide,
    });

    const ceilingMat = new MeshStandardMaterial({
      color: 0xfaf8f5,
      roughness: 1,
      side: THREE.BackSide,
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
    );
  }

  get center(): Vector3 {
    return new THREE.Vector3(0, this.height / 2, 0);
  }

  dispose(): void {
    this.#disposables.forEach((item) => item.dispose());
    this.#disposables.length = 0;
  }
}

export type { RoomOptions } from './types';

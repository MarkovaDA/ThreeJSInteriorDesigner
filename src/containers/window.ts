import {
  BoxGeometry,
  BufferGeometry,
  DoubleSide,
  Group,
  Material,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
} from 'three';
import type { WindowOptions } from './types';

export class RoomWindow extends Group {
  readonly frameMat: MeshStandardMaterial;
  readonly glassMat: MeshStandardMaterial;

  #disposables: Array<BufferGeometry | Material> = [];

  constructor({
    width = 1.8,
    height = 1.5,
    frameThickness = 0.07,
    frameDepth = 0.06,
    frameColor = 0xf5f2ec,
    glassColor = 0xb8d4ef,
    glassEmissive = 0xdcecff,
    glassOpacity = 0.45,
  }: WindowOptions = {}) {
    super();
    
    this.name = 'RoomWindow';

    this.frameMat = new MeshStandardMaterial({
      color: frameColor,
      roughness: 0.75,
      metalness: 0.05,
    });

    this.glassMat = new MeshStandardMaterial({
      color: glassColor,
      emissive: glassEmissive,
      emissiveIntensity: 0.55,
      transparent: true,
      opacity: glassOpacity,
      roughness: 0.15,
      metalness: 0,
      side: DoubleSide,
      depthWrite: false,
    });

    this.#disposables.push(this.frameMat, this.glassMat);

    const innerWidth = Math.max(width - frameThickness * 2, 0.2);
    const innerHeight = Math.max(height - frameThickness * 2, 0.2);

    this.#addFrameBar(width, frameThickness, frameDepth, 0, (height - frameThickness) / 2);
    this.#addFrameBar(width, frameThickness, frameDepth, 0, -(height - frameThickness) / 2);
    this.#addFrameBar(frameThickness, innerHeight, frameDepth, -(width - frameThickness) / 2, 0);
    this.#addFrameBar(frameThickness, innerHeight, frameDepth, (width - frameThickness) / 2, 0);

    this.#addFrameBar(frameThickness * 0.7, innerHeight, frameDepth * 0.8, 0, 0);
    this.#addFrameBar(innerWidth, frameThickness * 0.7, frameDepth * 0.8, 0, 0);

    const glassGeom = new PlaneGeometry(innerWidth, innerHeight);
    const glass = new Mesh(glassGeom, this.glassMat);
    glass.name = 'WindowGlass';
    glass.position.z = -frameDepth * 0.15;
    this.add(glass);
    this.#disposables.push(glassGeom);
  }

  #addFrameBar(
    width: number,
    height: number,
    depth: number,
    x: number,
    y: number,
  ): void {
    const geometry = new BoxGeometry(width, height, depth);
    const mesh = new Mesh(geometry, this.frameMat);
    mesh.position.set(x, y, 0);
    this.add(mesh);
    this.#disposables.push(geometry);
  }

  dispose(): void {
    this.#disposables.forEach((item) => item.dispose());
    this.#disposables.length = 0;
  }
}

export type { WindowOptions } from './types';

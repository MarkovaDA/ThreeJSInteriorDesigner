import {
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  DoubleSide,
  Group,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  Texture,
} from 'three';
import type { WindowOptions } from './types';

export class RoomWindow extends Group {
  readonly frameMat: MeshStandardMaterial;
  readonly glassMat: MeshStandardMaterial;
  readonly skyMat: MeshBasicMaterial;

  #disposables: Array<BufferGeometry | Material | Texture> = [];

  constructor({
    width = 1.8,
    height = 1.5,
    frameThickness = 0.07,
    frameDepth = 0.06,
    frameColor = 0xf5f2ec,
    glassColor = 0xb8d4ef,
    glassEmissive = 0xdcecff,
    glassOpacity = 0.22,
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
      emissiveIntensity: 0.25,
      transparent: true,
      opacity: glassOpacity,
      roughness: 0.12,
      metalness: 0,
      side: DoubleSide,
      depthWrite: false,
    });

    const skyTexture = this.#createCloudTexture();
    this.skyMat = new MeshBasicMaterial({
      map: skyTexture,
      toneMapped: false,
      depthWrite: true,
    });

    this.#disposables.push(this.frameMat, this.glassMat, this.skyMat, skyTexture);

    const innerWidth = Math.max(width - frameThickness * 2, 0.2);
    const innerHeight = Math.max(height - frameThickness * 2, 0.2);

    this.#addFrameBar(width, frameThickness, frameDepth, 0, (height - frameThickness) / 2);
    this.#addFrameBar(width, frameThickness, frameDepth, 0, -(height - frameThickness) / 2);
    this.#addFrameBar(frameThickness, innerHeight, frameDepth, -(width - frameThickness) / 2, 0);
    this.#addFrameBar(frameThickness, innerHeight, frameDepth, (width - frameThickness) / 2, 0);

    this.#addFrameBar(frameThickness * 0.7, innerHeight, frameDepth * 0.8, 0, 0);
    this.#addFrameBar(innerWidth, frameThickness * 0.7, frameDepth * 0.8, 0, 0);

    // Sky sits just behind the glass but still in front of the room wall.
    const skyGeom = new PlaneGeometry(innerWidth * 0.98, innerHeight * 0.98);
    const sky = new Mesh(skyGeom, this.skyMat);
    sky.name = 'WindowSky';
    sky.position.z = -frameDepth * 0.28;
    sky.renderOrder = 0;
    this.add(sky);
    this.#disposables.push(skyGeom);

    const glassGeom = new PlaneGeometry(innerWidth, innerHeight);
    const glass = new Mesh(glassGeom, this.glassMat);
    glass.name = 'WindowGlass';
    glass.position.z = -frameDepth * 0.08;
    glass.renderOrder = 1;
    this.add(glass);
    this.#disposables.push(glassGeom);
  }

  #createCloudTexture(): CanvasTexture {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return new CanvasTexture(canvas);
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, size);
    gradient.addColorStop(0, '#9ec8f0');
    gradient.addColorStop(0.45, '#c5dff7');
    gradient.addColorStop(1, '#e8f3fc');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const clouds: Array<{ x: number; y: number; r: number; a: number }> = [
      { x: 110, y: 160, r: 70, a: 0.55 },
      { x: 170, y: 150, r: 85, a: 0.5 },
      { x: 230, y: 165, r: 65, a: 0.45 },
      { x: 320, y: 220, r: 90, a: 0.4 },
      { x: 390, y: 210, r: 75, a: 0.48 },
      { x: 90, y: 320, r: 60, a: 0.35 },
      { x: 150, y: 340, r: 80, a: 0.42 },
      { x: 280, y: 360, r: 70, a: 0.38 },
      { x: 420, y: 330, r: 95, a: 0.4 },
      { x: 250, y: 90, r: 55, a: 0.35 },
    ];

    clouds.forEach(({ x, y, r, a }) => {
      const cloud = ctx.createRadialGradient(x, y, r * 0.15, x, y, r);
      cloud.addColorStop(0, `rgba(255, 255, 255, ${a})`);
      cloud.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = cloud;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;

    return texture;
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

import {
  BoxGeometry,
  BufferGeometry,
  CylinderGeometry,
  Group,
  Material,
  Mesh,
  MeshStandardMaterial,
} from 'three';
import type { DoorOptions } from './types';

export class RoomDoor extends Group {
  readonly frameMat: MeshStandardMaterial;
  readonly panelMat: MeshStandardMaterial;
  readonly handleMat: MeshStandardMaterial;

  #disposables: Array<BufferGeometry | Material> = [];

  constructor({
    width = 1.0,
    height = 2.2,
    frameThickness = 0.07,
    frameDepth = 0.08,
    panelDepth = 0.04,
    frameColor = 0xf5f2ec,
    panelColor = 0xc4a484,
    handleColor = 0xb8a078,
  }: DoorOptions = {}) {
    super();

    this.name = 'RoomDoor';

    this.frameMat = new MeshStandardMaterial({
      color: frameColor,
      roughness: 0.75,
      metalness: 0.05,
    });

    this.panelMat = new MeshStandardMaterial({
      color: panelColor,
      roughness: 0.7,
      metalness: 0.05,
    });

    this.handleMat = new MeshStandardMaterial({
      color: handleColor,
      roughness: 0.35,
      metalness: 0.65,
    });

    this.#disposables.push(this.frameMat, this.panelMat, this.handleMat);

    const innerWidth = Math.max(width - frameThickness * 2, 0.3);
    const innerHeight = Math.max(height - frameThickness, 0.5);

    this.#addFrameBar(width, frameThickness, frameDepth, 0, (height - frameThickness) / 2);
    this.#addFrameBar(frameThickness, innerHeight, frameDepth, -(width - frameThickness) / 2, -frameThickness / 2);
    this.#addFrameBar(frameThickness, innerHeight, frameDepth, (width - frameThickness) / 2, -frameThickness / 2);

    const panelGeom = new BoxGeometry(innerWidth, innerHeight, panelDepth);
    const panel = new Mesh(panelGeom, this.panelMat);
    panel.name = 'DoorPanel';
    panel.position.set(0, -frameThickness / 2, 0);
    this.add(panel);
    this.#disposables.push(panelGeom);

    this.#addPanelInset(innerWidth * 0.72, innerHeight * 0.38, panelDepth, 0, innerHeight * 0.18 - frameThickness / 2);
    this.#addPanelInset(innerWidth * 0.72, innerHeight * 0.38, panelDepth, 0, -innerHeight * 0.22 - frameThickness / 2);

    this.#addHandle(innerWidth, panelDepth);
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

  #addPanelInset(
    width: number,
    height: number,
    panelDepth: number,
    x: number,
    y: number,
  ): void {
    const border = 0.035;
    const depth = panelDepth * 0.55;

    const outerGeom = new BoxGeometry(width, height, depth);
    const outer = new Mesh(outerGeom, this.panelMat);
    outer.position.set(x, y, panelDepth * 0.35);
    this.add(outer);
    this.#disposables.push(outerGeom);

    const innerGeom = new BoxGeometry(
      Math.max(width - border * 2, 0.05),
      Math.max(height - border * 2, 0.05),
      depth * 0.7,
    );

    const inner = new Mesh(innerGeom, this.panelMat);
    inner.position.set(x, y, panelDepth * 0.55);
    
    this.add(inner);
    this.#disposables.push(innerGeom);
  }

  #addHandle(innerWidth: number, panelDepth: number): void {
    const handleX = innerWidth * 0.35;
    const handleY = -0.05;
    const handleZ = panelDepth * 0.75;

    const plateGeom = new BoxGeometry(0.04, 0.14, 0.01);
    const plate = new Mesh(plateGeom, this.handleMat);
    plate.position.set(handleX, handleY, handleZ);
    
    this.add(plate);
    this.#disposables.push(plateGeom);

    const leverGeom = new CylinderGeometry(0.012, 0.012, 0.11, 12);
    const lever = new Mesh(leverGeom, this.handleMat);
    lever.rotation.z = Math.PI / 2;
    lever.position.set(handleX - 0.04, handleY, handleZ + 0.02);
    
    this.add(lever);
    this.#disposables.push(leverGeom);
  }

  dispose(): void {
    this.#disposables.forEach((item) => item.dispose());
    this.#disposables.length = 0;
  }
}

export type { DoorOptions } from './types';

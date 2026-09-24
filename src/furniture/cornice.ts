import {
  BoxGeometry,
  BufferGeometry,
  CylinderGeometry,
  Group,
  Material,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
} from 'three';

export type CorniceOptions = {
  width?: number;
  rodRadius?: number;
  finialRadius?: number;
  color?: number;
};

export class Cornice extends Group {
  readonly metalMat: MeshStandardMaterial;

  #disposables: Array<BufferGeometry | Material> = [];

  constructor({
    width = 3.0,
    rodRadius = 0.022,
    finialRadius = 0.045,
    color = 0xc4a46a,
  }: CorniceOptions = {}) {
    super();

    this.name = 'Cornice';

    this.metalMat = new MeshStandardMaterial({
      color,
      roughness: 0.35,
      metalness: 0.75,
    });
    this.#disposables.push(this.metalMat);

    const rodGeom = new CylinderGeometry(rodRadius, rodRadius, width, 20);
    rodGeom.rotateZ(Math.PI / 2);
    const rod = new Mesh(rodGeom, this.metalMat);
    rod.name = 'CorniceRod';
    rod.castShadow = true;
    this.add(rod);
    this.#disposables.push(rodGeom);

    this.#addFinial(-(width / 2), finialRadius, rodRadius);
    this.#addFinial(width / 2, finialRadius, rodRadius);

    const bracketSpan = width * 0.36;
    this.#addBracket(-bracketSpan, rodRadius);
    this.#addBracket(bracketSpan, rodRadius);

    this.traverse((object) => {
      if (object instanceof Mesh) {
        object.renderOrder = 3;
      }
    });
  }

  #addFinial(x: number, finialRadius: number, rodRadius: number): void {
    const ballGeom = new SphereGeometry(finialRadius, 16, 12);
    const ball = new Mesh(ballGeom, this.metalMat);
    ball.position.set(x, 0, 0);
    ball.castShadow = true;
    this.add(ball);
    this.#disposables.push(ballGeom);

    const tipGeom = new SphereGeometry(finialRadius * 0.45, 12, 10);
    const tip = new Mesh(tipGeom, this.metalMat);
    tip.position.set(x + Math.sign(x || 1) * finialRadius * 0.85, 0, 0);
    tip.castShadow = true;
    this.add(tip);
    this.#disposables.push(tipGeom);

    const collarGeom = new CylinderGeometry(
      rodRadius * 1.6,
      rodRadius * 1.35,
      finialRadius * 0.55,
      12,
    );
    collarGeom.rotateZ(Math.PI / 2);
    const collar = new Mesh(collarGeom, this.metalMat);
    collar.position.set(x - Math.sign(x || 1) * finialRadius * 0.35, 0, 0);
    this.add(collar);
    this.#disposables.push(collarGeom);
  }

  #addBracket(x: number, rodRadius: number): void {
    const armGeom = new BoxGeometry(rodRadius * 1.4, rodRadius * 1.4, 0.1);
    const arm = new Mesh(armGeom, this.metalMat);
    arm.position.set(x, 0, -0.06);
    arm.castShadow = true;
    this.add(arm);
    this.#disposables.push(armGeom);

    const plateGeom = new BoxGeometry(0.08, 0.12, 0.02);
    const plate = new Mesh(plateGeom, this.metalMat);
    plate.position.set(x, 0, -0.12);
    this.add(plate);
    this.#disposables.push(plateGeom);
  }

  dispose(): void {
    this.#disposables.forEach((item) => item.dispose());
    this.#disposables.length = 0;
  }
}

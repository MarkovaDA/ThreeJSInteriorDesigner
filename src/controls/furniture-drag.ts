import {
  Box3,
  Object3D,
  Plane,
  Raycaster,
  Vector2,
  Vector3,
  type Camera,
} from 'three';
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { FurnitureDragBounds, FurnitureDragOptions } from './types';
import './furniture-hover-label.css';

type DragMode = 'move' | 'rotate';

export class FurnitureDragControls {
  #camera: Camera;
  #domElement: HTMLElement;
  #orbitControls: OrbitControls;
  #bounds: FurnitureDragBounds;
  #floorPlane: Plane;
  #wheelRotateStep: number;

  #raycaster = new Raycaster();
  #pointer = new Vector2();
  #hitPoint = new Vector3();
  #dragOffset = new Vector3();
  #labelWorld = new Vector3();
  #labelBox = new Box3();
  #boundsBox = new Box3();

  #targets: Object3D[] = [];
  #dragTarget: Object3D | null = null;
  #hoveredTarget: Object3D | null = null;
  #dragMode: DragMode | null = null;
  #pointerId: number | null = null;
  #rotateStartAngle = 0;
  #rotateStartY = 0;

  #label: HTMLDivElement;
  #labelTitle: HTMLSpanElement;
  #labelHint: HTMLSpanElement;

  constructor(
    camera: Camera,
    domElement: HTMLElement,
    orbitControls: OrbitControls,
    {
      floorY = 0,
      bounds,
      wheelRotateStep = Math.PI / 18,
      labelContainer,
    }: FurnitureDragOptions,
  ) {
    this.#camera = camera;
    this.#domElement = domElement;
    this.#orbitControls = orbitControls;
    this.#bounds = bounds;
    this.#floorPlane = new Plane(new Vector3(0, 1, 0), -floorY);
    this.#wheelRotateStep = wheelRotateStep;

    this.#label = document.createElement('div');
    this.#label.className = 'furniture-hover-label';
    this.#label.hidden = true;

    this.#labelTitle = document.createElement('span');
    this.#labelTitle.className = 'furniture-hover-label__title';

    this.#labelHint = document.createElement('span');
    this.#labelHint.className = 'furniture-hover-label__hint';

    for (const line of ['LMB move', 'RMB rotate', 'Wheel turn']) {
      const row = document.createElement('span');
      row.textContent = line;
      this.#labelHint.appendChild(row);
    }

    this.#label.append(this.#labelTitle, this.#labelHint);

    const host = labelContainer ?? domElement.parentElement ?? document.body;
    host.appendChild(this.#label);

    this.#domElement.addEventListener('pointerdown', this.#onPointerDown, true);
    this.#domElement.addEventListener('pointermove', this.#onPointerMove);
    this.#domElement.addEventListener('pointerup', this.#onPointerUp);
    this.#domElement.addEventListener('pointercancel', this.#onPointerUp);
    this.#domElement.addEventListener('pointerleave', this.#onPointerLeave);
    this.#domElement.addEventListener('wheel', this.#onWheel, { passive: false });
    this.#domElement.addEventListener('contextmenu', this.#onContextMenu);
  }

  addTarget(target: Object3D): void {
    if (!this.#targets.includes(target)) {
      this.#targets.push(target);
    }
  }

  removeTarget(target: Object3D): void {
    this.#targets = this.#targets.filter((item) => item !== target);

    if (this.#dragTarget === target) {
      this.#endDrag();
    }

    if (this.#hoveredTarget === target) {
      this.#hoveredTarget = null;
      this.#hideLabel();
    }
  }

  /** Keep the hover label glued to the object while the camera moves. */
  update(): void {
    if (!this.#hoveredTarget || this.#dragMode) {
      this.#hideLabel();
      return;
    }

    this.#positionLabel(this.#hoveredTarget);
  }

  dispose(): void {
    this.#endDrag();
    this.#hideLabel();
    this.#label.remove();
    this.#domElement.removeEventListener('pointerdown', this.#onPointerDown, true);
    this.#domElement.removeEventListener('pointermove', this.#onPointerMove);
    this.#domElement.removeEventListener('pointerup', this.#onPointerUp);
    this.#domElement.removeEventListener('pointercancel', this.#onPointerUp);
    this.#domElement.removeEventListener('pointerleave', this.#onPointerLeave);
    this.#domElement.removeEventListener('wheel', this.#onWheel);
    this.#domElement.removeEventListener('contextmenu', this.#onContextMenu);
    this.#targets = [];
  }

  #onContextMenu = (event: MouseEvent): void => {
    this.#updatePointer(event);

    if (this.#dragMode === 'rotate' || this.#pickTarget()) {
      event.preventDefault();
    }
  };

  #onPointerDown = (event: PointerEvent): void => {
    if (this.#targets.length === 0) {
      return;
    }

    const isMove = event.button === 0;
    const isRotate = event.button === 2;

    if (!isMove && !isRotate) {
      return;
    }

    this.#updatePointer(event);

    const target = this.#pickTarget();

    if (!target) {
      return;
    }

    this.#raycaster.setFromCamera(this.#pointer, this.#camera);

    if (!this.#intersectFloor()) {
      return;
    }

    const localHit = this.#toParentLocal(target, this.#hitPoint);

    this.#dragTarget = target;
    this.#dragMode = isMove ? 'move' : 'rotate';
    this.#pointerId = event.pointerId;
    this.#hideLabel();

    if (isMove) {
      this.#dragOffset.set(
        target.position.x - localHit.x,
        0,
        target.position.z - localHit.z,
      );
    } else {
      this.#rotateStartAngle = Math.atan2(
        localHit.x - target.position.x,
        localHit.z - target.position.z,
      );
      this.#rotateStartY = target.rotation.y;
    }

    this.#domElement.style.cursor = 'grabbing';
    this.#orbitControls.enabled = false;
    this.#domElement.setPointerCapture(event.pointerId);

    event.preventDefault();
    event.stopPropagation();
  };

  #onPointerMove = (event: PointerEvent): void => {
    this.#updatePointer(event);

    if (this.#dragTarget && event.pointerId === this.#pointerId && this.#dragMode) {
      this.#raycaster.setFromCamera(this.#pointer, this.#camera);

      if (!this.#intersectFloor()) {
        return;
      }

      const localHit = this.#toParentLocal(this.#dragTarget, this.#hitPoint);

      if (this.#dragMode === 'move') {
        this.#dragTarget.position.x = localHit.x + this.#dragOffset.x;
        this.#dragTarget.position.z = localHit.z + this.#dragOffset.z;
        this.#clampPositionToBounds(this.#dragTarget);

        return;
      }

      const angle = Math.atan2(
        localHit.x - this.#dragTarget.position.x,
        localHit.z - this.#dragTarget.position.z,
      );

      this.#dragTarget.rotation.y =
        this.#rotateStartY + (angle - this.#rotateStartAngle);

      return;
    }

    this.#updateHover();
  };

  #onPointerUp = (event: PointerEvent): void => {
    if (event.pointerId !== this.#pointerId) {
      return;
    }

    this.#endDrag();
    this.#updateHover();
  };

  #onPointerLeave = (): void => {
    if (this.#dragMode) {
      return;
    }

    this.#hoveredTarget = null;
    this.#hideLabel();
  };

  #onWheel = (event: WheelEvent): void => {
    if (this.#targets.length === 0) {
      return;
    }

    this.#updatePointer(event);

    const target = this.#dragTarget ?? this.#pickTarget();

    if (!target) {
      return;
    }

    const direction = event.deltaY > 0 ? 1 : -1;
    target.rotation.y += direction * this.#wheelRotateStep;

    event.preventDefault();
    event.stopPropagation();
  };

  /**
   * Clamp the pivot so the object's current world AABB stays inside the room.
   * Extents follow the live orientation (so depth vs width both work after yaw).
   */
  #clampPositionToBounds(target: Object3D): void {
    const { minX, maxX, minZ, maxZ } = this.#bounds;

    target.updateWorldMatrix(true, true);
    this.#boundsBox.setFromObject(target);

    const pivotX = target.position.x;
    const pivotZ = target.position.z;
    const extentMinX = pivotX - this.#boundsBox.min.x;
    const extentMaxX = this.#boundsBox.max.x - pivotX;
    const extentMinZ = pivotZ - this.#boundsBox.min.z;
    const extentMaxZ = this.#boundsBox.max.z - pivotZ;

    target.position.x = Math.min(
      Math.max(pivotX, minX + extentMinX),
      maxX - extentMaxX,
    );
    target.position.z = Math.min(
      Math.max(pivotZ, minZ + extentMinZ),
      maxZ - extentMaxZ,
    );
  }

  #updateHover(): void {
    const target = this.#pickTarget();

    this.#hoveredTarget = target;

    if (!target) {
      this.#hideLabel();
      return;
    }

    const label =
      typeof target.userData.label === 'string' ? target.userData.label : target.name;

    this.#labelTitle.textContent = label;
    this.#positionLabel(target);
  }

  #positionLabel(target: Object3D): void {
    this.#labelBox.setFromObject(target);
    this.#labelBox.getCenter(this.#labelWorld);
    this.#labelWorld.y = this.#labelBox.max.y;

    this.#labelWorld.project(this.#camera);

    const rect = this.#domElement.getBoundingClientRect();
    const host = this.#label.offsetParent as HTMLElement | null;
    const hostRect = host?.getBoundingClientRect() ?? rect;

    const x = (this.#labelWorld.x * 0.5 + 0.5) * rect.width + rect.left - hostRect.left;
    const y = (-this.#labelWorld.y * 0.5 + 0.5) * rect.height + rect.top - hostRect.top;

    const visible =
      this.#labelWorld.z >= -1 &&
      this.#labelWorld.z <= 1 &&
      x >= 0 &&
      y >= 0 &&
      x <= hostRect.width &&
      y <= hostRect.height;

    this.#label.hidden = !visible;
    this.#label.style.left = `${x}px`;
    this.#label.style.top = `${y}px`;
  }

  #hideLabel(): void {
    this.#label.hidden = true;
  }

  #endDrag(): void {
    if (this.#pointerId !== null && this.#domElement.hasPointerCapture(this.#pointerId)) {
      this.#domElement.releasePointerCapture(this.#pointerId);
    }

    this.#dragTarget = null;
    this.#dragMode = null;
    this.#pointerId = null;
    this.#orbitControls.enabled = true;
    this.#domElement.style.cursor = '';
  }

  #pickTarget(): Object3D | null {
    this.#raycaster.setFromCamera(this.#pointer, this.#camera);

    const intersections = this.#raycaster.intersectObjects(this.#targets, true);

    if (intersections.length === 0) {
      return null;
    }

    return this.#findTargetRoot(intersections[0].object);
  }

  #updatePointer(event: PointerEvent | WheelEvent | MouseEvent): void {
    const rect = this.#domElement.getBoundingClientRect();

    this.#pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.#pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  #intersectFloor(): boolean {
    return this.#raycaster.ray.intersectPlane(this.#floorPlane, this.#hitPoint) !== null;
  }

  #toParentLocal(target: Object3D, worldPoint: Vector3): Vector3 {
    const local = worldPoint.clone();

    if (target.parent) {
      target.parent.worldToLocal(local);
    }

    return local;
  }

  #findTargetRoot(object: Object3D): Object3D | null {
    let current: Object3D | null = object;

    while (current) {
      if (this.#targets.includes(current)) {
        return current;
      }

      current = current.parent;
    }

    return null;
  }
}

export type { FurnitureDragBounds, FurnitureDragOptions } from './types';

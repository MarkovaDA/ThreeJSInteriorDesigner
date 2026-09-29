import type { Vector3 } from 'three';

export type ControlsOptions = {
  target?: Vector3;
  minDistance?: number;
  maxDistance?: number;
  dampingFactor?: number;
};

export type PanelPosition = {
  x: number;
  y: number;
};

export type FurniturePanelProps = {
  selectedId?: string | null;
  onSelect?: (id: string) => void;
};

export type FurnitureDragBounds = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
};

export type FurnitureDragOptions = {
  /** World-space Y of the floor plane. */
  floorY?: number;
  bounds: FurnitureDragBounds;
  /** Radians per wheel notch when rotating with the mouse wheel. */
  wheelRotateStep?: number;
  /** Optional host for the hover label overlay (defaults to the canvas parent). */
  labelContainer?: HTMLElement;
};

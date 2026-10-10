import type { Object3D, Vector3 } from 'three';

export type ControlsOptions = {
  target?: Vector3;
  minDistance?: number;
  maxDistance?: number;
  dampingFactor?: number;
};

export type FurniturePanelProps = {
  selectedId?: string | null;
  selectedChoiceId?: string | null;
  isModelLoading?: boolean;
  onSelect?: (id: string) => void;
  onChoiceSelect?: (choiceId: string) => void;
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
  /**
   * Fires on a short LMB click: the furniture root, or `null` when clicking empty space.
   * Dragging past the move threshold does not count as a click.
   */
  onSelect?: (target: Object3D | null) => void;
};

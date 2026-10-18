import type { Object3D } from 'three';
import type { SceneFurnitureSelection } from '@/furniture/types';

/** Reads furniture id/label from a scene object for selection callbacks. */
export function resolveFurnitureSelection(
  target: Object3D,
): SceneFurnitureSelection {
  const targetFurnitureId = target.userData.furnitureId;
  const targetLabel = target.userData.label
  
  const id =
    typeof targetFurnitureId === 'string'
      ? targetFurnitureId
      : target.name || 'furniture';

  const label =
    typeof targetLabel === 'string'
      ? targetLabel
      : target.name || 'Furniture';

  return { id, label };
}

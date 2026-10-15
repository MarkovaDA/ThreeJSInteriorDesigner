import { Box3, type Scene } from 'three';
import type { FurnitureDragControls } from '../../controls';
import type { Room } from '../../containers/room';
import { DEFAULT_SOFA_MODEL, Sofa } from '../../furniture/sofa';
import {
  loadFurnitureObject,
  type FurnitureLoadingNotifier,
  type LoadFurnitureResult,
} from '../../utils/loaders';
import { FurnitureTargetWidth, SofaPose } from '../enums';

export type PlaceSofaContext = {
  scene: Scene;
  room: Room;
  loading: FurnitureLoadingNotifier;
  dragControls: FurnitureDragControls | null;
  getSofa: () => Sofa | null;
  setSofa: (sofa: Sofa | null) => void;
  isCancelled: () => boolean;
};

export type PlaceSofaOptions = {
  model?: string | null;
};

/** First placement: on the floor, back flush against the -Z wall. */
export function applyDefaultSofaPose(sofa: Sofa, room: Room): void {
  sofa.position.set(0, 0, 0);
  sofa.placeOnFloor(SofaPose.FloorY);
  sofa.rotation.y = SofaPose.RotationY;

  sofa.updateMatrixWorld(true);
  
  const box = new Box3().setFromObject(sofa);
  sofa.position.z += -room.depth / 2 - box.min.z;
}

/**
 * Loads (or replaces) the sofa and positions it. Returns the appear handle
 * without waiting for the animation — caller awaits `finished` and registers
 * drag controls afterward.
 */
export async function placeSofa(
  ctx: PlaceSofaContext,
  { model = null }: PlaceSofaOptions = {},
): Promise<LoadFurnitureResult<Sofa> | null> {
  const previous = ctx.getSofa();
  const previousPosition = previous?.position.clone() ?? null;
  const previousRotationY = previous?.rotation.y ?? 0;

  return loadFurnitureObject({
    id: 'sofa',
    label: 'Sofa',
    loading: ctx.loading,
    isCancelled: ctx.isCancelled,
    load: () =>
      Sofa.load({
        model: model ?? undefined,
        targetWidth: FurnitureTargetWidth.Sofa,
      }),
    onLoaded: (loaded) => {
      if (previous) {
        ctx.dragControls?.removeTarget(previous);
        ctx.scene.remove(previous);
        previous.dispose();
      }

      ctx.setSofa(loaded);
      loaded.userData.furnitureId = 'sofa';
      loaded.userData.label = 'Sofa';
      loaded.userData.model = model ?? DEFAULT_SOFA_MODEL;

      if (previousPosition) {
        loaded.position.copy(previousPosition);
        loaded.rotation.y = previousRotationY;
        loaded.placeOnFloor(SofaPose.FloorY);
      } else {
        applyDefaultSofaPose(loaded, ctx.room);
      }

      ctx.scene.add(loaded);
    },
  });
}

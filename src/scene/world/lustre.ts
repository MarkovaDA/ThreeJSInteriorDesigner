import type { Scene } from 'three';
import type { Room } from '../../containers/room';
import { Lustre } from '../../furniture/lustre';
import {
  loadFurnitureObject,
  type FurnitureLoadingNotifier,
  type LoadFurnitureResult,
} from '../../utils/loaders';
import { FurnitureTargetWidth, LustreHang } from '../enums';

export function loadLustre(options: {
  scene: Scene;
  room: Room;
  model: string;
  loading: FurnitureLoadingNotifier;
  isCancelled: () => boolean;
  onReady?: (result: LoadFurnitureResult<Lustre>) => void;
  onObject: (lustre: Lustre) => void;
}): void {
  const { scene, room, model, loading, isCancelled, onReady, onObject } =
    options;

  void loadFurnitureObject({
    id: 'lamp',
    label: 'Lustre',
    loading,
    isCancelled,
    load: () =>
      Lustre.load({
        model,
        targetWidth: FurnitureTargetWidth.Lustre,
      }),
    onLoaded: (loaded) => {
      onObject(loaded);
      loaded.userData.furnitureId = 'lamp';
      loaded.userData.label = 'Lustre';
      loaded.hangFromCeiling({
        x: LustreHang.X,
        z: LustreHang.Z,
        gap: LustreHang.Gap,
        ceilingY: room.height,
      });
      scene.add(loaded);
    },
  })
    .then((result) => {
      if (!result) {
        return;
      }

      onReady?.(result);
    })
    .catch((error: unknown) => {
      console.error('Failed to load lustre model:', error);
    });
}

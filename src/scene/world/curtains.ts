import type { Cornice } from '../../furniture/cornice';
import { Curtains } from '../../furniture/curtains';
import {
  loadFurnitureObject,
  type FurnitureLoadingNotifier,
  type LoadFurnitureResult,
} from '../../utils/loaders';
import { CurtainsHang, FurnitureTargetWidth } from '../enums';

export function loadCurtains(options: {
  cornice: Cornice;
  loading: FurnitureLoadingNotifier;
  isCancelled: () => boolean;
  onReady: (result: LoadFurnitureResult<Curtains>) => void;
  onObject: (curtains: Curtains) => void;
}): void {
  const { cornice, loading, isCancelled, onReady, onObject } = options;

  void loadFurnitureObject({
    id: 'curtains',
    label: 'Curtains',
    loading,
    isCancelled,
    load: () => Curtains.load({ targetWidth: FurnitureTargetWidth.Curtains }),
    onLoaded: (loaded) => {
      onObject(loaded);
      loaded.hangFromRod({
        x: CurtainsHang.X,
        z: CurtainsHang.Z,
        gap: CurtainsHang.Gap,
      });
      cornice.add(loaded);
    },
  })
    .then((result) => {
      if (!result) {
        return;
      }

      onReady(result);
    })
    .catch((error: unknown) => {
      console.error('Failed to load curtains model:', error);
    });
}

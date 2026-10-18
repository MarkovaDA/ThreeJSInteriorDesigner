import { useEffect, useRef } from 'react';
import {
  createFurnitureLoadingNotifier,
  type FurnitureLoadingNotifier,
} from '@/scene/loaders';

import { ItemLoadToSceneService } from '@/scene/services';
import type { UseLoadFurnitureOptions } from '@/scene/types';
import { placeSofa } from '@/scene/utils';

/** Owns furniture loading UI state and reacts to panel place/replace requests. */
export function useLoadFurniture({
  selectedFurnitureId,
  furnitureRequestId = 0,
  sofaModel,
  onFurnitureLoadingChange,
}: UseLoadFurnitureOptions): FurnitureLoadingNotifier {
  const onFurnitureLoadingChangeRef = useRef(onFurnitureLoadingChange);
  const loadingNotifierRef = useRef<FurnitureLoadingNotifier | undefined>(
    undefined,
  );

  onFurnitureLoadingChangeRef.current = onFurnitureLoadingChange;

  if (!loadingNotifierRef.current) {
    loadingNotifierRef.current = createFurnitureLoadingNotifier((state) => {
      onFurnitureLoadingChangeRef.current?.(state);
    });
  }

  useEffect(() => {
    if (!ItemLoadToSceneService.getInstance()) {
      return;
    }

    if (sofaModel) {
      void placeSofa(sofaModel, true);

      return;
    }

    if (selectedFurnitureId === 'sofa' && furnitureRequestId > 0) {
      void placeSofa();
    }
  }, [selectedFurnitureId, furnitureRequestId, sofaModel]);

  useEffect(() => {
    return () => {
      loadingNotifierRef.current?.clear();
    };
  }, []);

  return loadingNotifierRef.current;
}
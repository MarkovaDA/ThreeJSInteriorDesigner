import { useEffect, useRef } from 'react';
import { LustreModel } from '../../scene/enums';
import { SceneRuntime } from '../../scene/runtime';
import type { SceneProps } from '../../scene/types';

/**
 * Mounts {@link SceneRuntime} into a container and syncs panel-driven furniture requests.
 */
export function useSceneRuntime({
  selectedFurnitureId = null,
  furnitureRequestId = 0,
  sofaModel = null,
  lustreModel = LustreModel.Default,
  onFurnitureSelect,
  onFurnitureLoadingChange,
  onModelZoomReady,
}: SceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<SceneRuntime | null>(null);

  const propsRef = useRef({
    lustreModel,
    onFurnitureSelect,
    onFurnitureLoadingChange,
    onModelZoomReady,
  });

  propsRef.current = {
    lustreModel,
    onFurnitureSelect,
    onFurnitureLoadingChange,
    onModelZoomReady,
  };

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const runtime = new SceneRuntime({
      container,
      lustreModel: propsRef.current.lustreModel,
      getCallbacks: () => ({
        onFurnitureSelect: propsRef.current.onFurnitureSelect,
        onFurnitureLoadingChange: propsRef.current.onFurnitureLoadingChange,
        onModelZoomReady: propsRef.current.onModelZoomReady,
      }),
    });

    runtimeRef.current = runtime;
    runtime.placeDefaultSofa();

    return () => {
      runtime.dispose();
      runtimeRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!selectedFurnitureId || furnitureRequestId <= 0) {
      return;
    }

    void runtimeRef.current?.placeFurniture(selectedFurnitureId);
  }, [selectedFurnitureId, furnitureRequestId]);

  useEffect(() => {
    if (!sofaModel) {
      return;
    }

    void runtimeRef.current?.placeFurniture('sofa', sofaModel, true);
  }, [sofaModel]);

  return { containerRef };
}

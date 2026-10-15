import { useEffect, useRef } from 'react';
import { LustreModel } from './enums';
import { SceneRuntime } from './runtime';
import type { SceneProps } from './types';

/**
 * React shell for the Three.js interior scene.
 * Mounts a {@link SceneRuntime} and forwards panel-driven furniture requests.
 */
export default function Scene({
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

  return <div ref={containerRef} className="scene" />;
}

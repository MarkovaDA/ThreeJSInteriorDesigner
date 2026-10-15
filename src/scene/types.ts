import type { ModelZoom } from '../camera/types';
import type {
  FurnitureLoadingState,
  SceneFurnitureSelection,
} from '../furniture/types';

export type { FurnitureLoadingState, SceneFurnitureSelection };

export type SceneCallbacks = {
  onFurnitureSelect?: (selection: SceneFurnitureSelection | null) => void;
  onFurnitureLoadingChange?: (state: FurnitureLoadingState | null) => void;
  onModelZoomReady?: (zoom: ModelZoom) => void;
};

export type SceneProps = {
  selectedFurnitureId?: string | null;
  furnitureRequestId?: number;
  /** Sofa GLB filename from the furniture panel choice list. */
  sofaModel?: string | null;
  /** GLB filename for the ceiling lustre (`public/furniture/lustre/`). */
  lustreModel?: string;
  onFurnitureSelect?: SceneCallbacks['onFurnitureSelect'];
  onFurnitureLoadingChange?: SceneCallbacks['onFurnitureLoadingChange'];
  onModelZoomReady?: SceneCallbacks['onModelZoomReady'];
};

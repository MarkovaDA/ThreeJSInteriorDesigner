export type { IFurniture } from '../furniture';

export type FurnitureIconId =
  | 'chair'
  | 'table'
  | 'sofa'
  | 'bed'
  | 'wardrobe'
  | 'lamp'
  | 'curtains'
  | 'cornice';

export type FurnitureItem = {
  id: string;
  name: string;
  icon: FurnitureIconId;
  /** Public folder with `.glb` variants, e.g. `furniture/sofa`. */
  variantsDir?: string;
};

/** One `.glb` variant from a category `index.json` catalog. */
export type FurnitureModelChoice = {
  id: string;
  label: string;
  file: string;
};

/** Shared options for GLB furniture that scales to a target width. */
export type GltfFurnitureOptions = {
  /** GLB filename inside the category folder under `public/furniture/`. */
  model?: string;
  /** Target width along the longest horizontal axis, in meters. */
  targetWidth?: number;
};

export type SofaOptions = GltfFurnitureOptions;
export type TableOptions = GltfFurnitureOptions;
export type AbazureOptions = GltfFurnitureOptions;
export type LustreOptions = GltfFurnitureOptions;

export type CurtainsOptions = {
  /** Target width across the window, in meters. */
  targetWidth?: number;
  /** Soft fabric color applied to UV-unwrapped meshes without textures. */
  fabricColor?: number;
  fabricRoughness?: number;
};

export type CorniceOptions = {
  width?: number;
  rodRadius?: number;
  finialRadius?: number;
  color?: number;
};

export type SceneFurnitureSelection = {
  id: string;
  label: string;
};

/** Active furniture model load shown in the scene/panel loader UI. */
export type FurnitureLoadingState = {
  id: string;
  label: string;
};

export type SceneProps = {
  selectedFurnitureId?: string;
  furnitureRequestId?: number;
  /** Sofa GLB filename from the furniture panel choice list. */
  sofaModel?: string;
  /** Table GLB filename from the furniture panel choice list. */
  tableModel?: string;
  /** Abazure / floor-lamp GLB filename from the furniture panel choice list. */
  abazureModel?: string;
  /** GLB filename for the ceiling lustre (`public/furniture/lustre/`). */
  lustreModel?: string;
  onFurnitureSelect?: (selection?: SceneFurnitureSelection) => void;
  onFurnitureLoadingChange?: (state?: FurnitureLoadingState) => void;
  /** Fires once the scene model-zoom API is ready. */
  onModelZoomReady?: (
    zoom: import('@/camera/types').ModelZoom,
  ) => void;
};

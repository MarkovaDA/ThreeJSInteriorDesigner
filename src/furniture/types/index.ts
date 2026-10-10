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

export type SofaOptions = {
  /** GLB filename inside `public/furniture/sofa/`, e.g. `sofa_grey.glb`. */
  model?: string;
  /** Target width along the longest horizontal axis, in meters. */
  targetWidth?: number;
};

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

export type LustreOptions = {
  /** GLB filename inside `public/furniture/lustre/`, e.g. `red_cuisine.glb`. */
  model?: string;
  /** Target width along the longest horizontal axis, in meters. */
  targetWidth?: number;
};

export type SceneFurnitureSelection = {
  id: string;
  label: string;
};

export type SceneProps = {
  selectedFurnitureId?: string | null;
  furnitureRequestId?: number;
  /** Sofa GLB filename from the furniture panel choice list. */
  sofaModel?: string | null;
  /** GLB filename for the ceiling lustre (`public/furniture/lustre/`). */
  lustreModel?: string;
  onFurnitureSelect?: (selection: SceneFurnitureSelection | null) => void;
  onSofaLoadingChange?: (loading: boolean) => void;
};

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
};

export type SofaOptions = {
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

export type SceneFurnitureSelection = {
  id: string;
  label: string;
};

export type SceneProps = {
  selectedFurnitureId?: string | null;
  furnitureRequestId?: number;
  onFurnitureSelect?: (selection: SceneFurnitureSelection | null) => void;
};

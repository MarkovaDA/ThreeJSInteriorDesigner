export type FurnitureIconId =
  | 'chair'
  | 'table'
  | 'sofa'
  | 'bed'
  | 'wardrobe'
  | 'lamp';

export type FurnitureItem = {
  id: string;
  name: string;
  icon: FurnitureIconId;
};

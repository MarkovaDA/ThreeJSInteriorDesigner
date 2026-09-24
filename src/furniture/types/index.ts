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

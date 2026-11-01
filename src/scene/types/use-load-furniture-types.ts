import type { FurnitureLoadingState } from '@/furniture/types';

export type UseLoadFurnitureOptions = {
  selectedFurnitureId?: string;
  furnitureRequestId?: number;
  sofaModel?: string;
  tableModel?: string;
  abazureModel?: string;
  onFurnitureLoadingChange?: (state?: FurnitureLoadingState) => void;
};

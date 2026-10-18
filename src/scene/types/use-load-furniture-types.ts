import type { FurnitureLoadingState } from '@/furniture/types';

export type UseLoadFurnitureOptions = {
  selectedFurnitureId?: string;
  furnitureRequestId?: number;
  sofaModel?: string;
  onFurnitureLoadingChange?: (state?: FurnitureLoadingState) => void;
};

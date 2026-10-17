import type { Object3D } from 'three';
import type { FurnitureLoadingState } from '@/furniture/types';
import type { AppearAnimationOptions } from './appear-types';

export type FurnitureLoadingNotifier = {
  start: (state: FurnitureLoadingState) => void;
  stop: (id: string) => void;
  clear: () => void;
};

export type LoadFurnitureResult<T extends Object3D> = {
  object: T;
  cancel: () => void;
  finished: Promise<void>;
};

export type LoadFurnitureOptions<T extends Object3D> = {
  id: string;
  label: string;
  load: () => Promise<T>;
  /** Place / configure the object before appear runs. */
  onLoaded?: (object: T) => void | Promise<void>;
  loading?: FurnitureLoadingNotifier;
  appear?: AppearAnimationOptions | false;
  isCancelled?: () => boolean;
};

import type { Object3D, Scene as ThreeScene, Vector3 } from 'three';
import type { FurnitureDragControls } from '@/controls';
import type { Room } from '@/containers/room';
import type { FurnitureLoadingNotifier } from './load-furniture-types';

export type ItemLoadToSceneServiceOptions = {
  scene: ThreeScene;
  room: Room;
  loading: FurnitureLoadingNotifier;
  getDragControls: () => FurnitureDragControls | undefined;
  isCancelled: () => boolean;
};

export type ItemPlaceContext = {
  scene: ThreeScene;
  room: Room;
  previous?: Object3D;
  previousPosition?: Vector3;
  previousRotationY: number;
};

export type ItemPlaceOptions<T extends Object3D> = {
  id: string;
  label: string;
  model?: string;
  replace?: boolean;
  load: () => Promise<T>;
  /** Position / parent the object; service then adds it to `scene` if still orphaned. */
  placeOnScene: (object: T, ctx: ItemPlaceContext) => void | Promise<void>;
  /** Register with drag controls after appear (default: true). */
  draggable?: boolean;
};

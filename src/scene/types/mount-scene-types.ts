import type { Scene as ThreeScene } from 'three';
import type { ModelZoom } from '@/camera';
import type { SceneFurnitureSelection } from '@/furniture/types';
import type { FurnitureLoadingNotifier } from './load-furniture-types';

export type MountSceneOptions = {
  container: HTMLDivElement;
  loading: FurnitureLoadingNotifier;
  lustreModel: string;
  isCancelled: () => boolean;
  onSceneReady: (scene: ThreeScene) => void;
  onModelZoomReady: (zoom: ModelZoom) => void;
  onFurnitureSelect: (selection?: SceneFurnitureSelection) => void;
};

export type MountedScene = {
  dispose: () => void;
};

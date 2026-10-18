import type { Camera, Scene as ThreeScene } from 'three';
import type { Controls, FurnitureDragControls } from '@/controls';
import type { Renderer } from '@/renderer/renderer';

export type AnimateSceneOptions = {
  scene: ThreeScene;
  camera: Camera;
  renderer: Renderer;
  controls: Controls;
  getDragControls: () => FurnitureDragControls | undefined;
};

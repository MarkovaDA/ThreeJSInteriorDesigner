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

/** Starts the render loop; returns a function that stops it. */
export function animate({
  scene,
  camera,
  renderer,
  controls,
  getDragControls,
}: AnimateSceneOptions): () => void {
  let frameId = 0;

  const tick = () => {
    frameId = requestAnimationFrame(tick);
    controls.update();
    getDragControls()?.update();
    renderer.render(scene, camera);
  };

  tick();

  return () => {
    cancelAnimationFrame(frameId);
  };
}

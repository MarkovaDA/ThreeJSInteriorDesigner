import type { AnimateSceneOptions } from '@/scene/types';

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

import { useSceneRuntime } from '../utils/hooks';
import type { SceneProps } from './types';

/**
 * React shell for the Three.js interior scene.
 * Mounts a {@link SceneRuntime} and forwards panel-driven furniture requests.
 */
export default function Scene(props: SceneProps) {
  const { containerRef } = useSceneRuntime(props);

  return <div ref={containerRef} className="scene" />;
}

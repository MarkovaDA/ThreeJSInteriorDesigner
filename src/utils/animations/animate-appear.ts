import type { Object3D } from 'three';
import type {
  AppearAnimation,
  AppearAnimationOptions,
} from '@/scene/types';

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/** Scale + lift-in appear for a placed furniture object. */
export function animateAppear(
  object: Object3D,
  {
    durationMs = 560,
    fromScale = 0.12,
    lift = 0.22,
  }: AppearAnimationOptions = {},
): AppearAnimation {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return {
      cancel: () => {},
      finished: Promise.resolve(),
    };
  }

  const targetScaleX = object.scale.x;
  const targetScaleY = object.scale.y;
  const targetScaleZ = object.scale.z;
  const targetY = object.position.y;
  const startScale = Math.max(fromScale, 0.001);

  object.scale.set(
    targetScaleX * startScale,
    targetScaleY * startScale,
    targetScaleZ * startScale,
  );

  object.position.y = targetY - lift;

  let frameId = 0;
  let cancelled = false;
  const startedAt = performance.now();

  const restore = () => {
    object.scale.set(targetScaleX, targetScaleY, targetScaleZ);
    object.position.y = targetY;
  };

  const finished = new Promise<void>((resolve) => {
    const tick = (now: number) => {
      if (cancelled) {
        resolve();
        return;
      }

      const progress = Math.min(1, (now - startedAt) / durationMs);
      const eased = easeOutCubic(progress);
      const scaleFactor = startScale + (1 - startScale) * eased;

      object.scale.set(
        targetScaleX * scaleFactor,
        targetScaleY * scaleFactor,
        targetScaleZ * scaleFactor,
      );

      object.position.y = targetY - lift * (1 - eased);

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
        return;
      }

      restore();
      resolve();
    };

    frameId = requestAnimationFrame(tick);
  });

  return {
    cancel: () => {
      if (cancelled) {
        return;
      }

      cancelled = true;
      cancelAnimationFrame(frameId);
      restore();
    },
    finished,
  };
}

export type {
  AppearAnimation,
  AppearAnimationOptions,
} from '@/scene/types';

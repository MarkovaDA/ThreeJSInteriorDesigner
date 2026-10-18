import type { Object3D } from 'three';
import { Curtains } from '@/furniture/curtains';
import { Lustre } from '@/furniture/lustre';
import { DEFAULT_SOFA_MODEL, Sofa } from '@/furniture/sofa';

import {
  ItemLoadToSceneService,
  placeFloorItemAgainstBackWall,
} from '../services';

type HangParent = Object3D & {
  add(object: Object3D): Object3D;
};

/** Default room furniture seeded once when the scene mounts. */
export async function seedDefaultFurniture(options: {
  lustreModel: string;
  cornice: HangParent;
}): Promise<void> {
  const { lustreModel, cornice } = options;

  await Promise.all([
    placeCurtains(cornice),
    placeLustre(lustreModel),
    placeSofa(),
  ]);
}

export function placeSofa(
  model?: string,
  replace = false,
): Promise<void> {
  const service = ItemLoadToSceneService.getInstance();

  if (!service) {
    return Promise.resolve();
  }

  const resolvedModel = model ?? DEFAULT_SOFA_MODEL;

  return service.placeItemToScene({
    id: 'sofa',
    label: 'Sofa',
    model: resolvedModel,
    replace,
    load: () =>
      Sofa.load({
        model: model ?? undefined,
        targetWidth: 2.4,
      }),
    placeOnScene: (loaded, ctx) => {
      placeFloorItemAgainstBackWall(loaded, ctx);
    },
  });
}

export function placeCurtains(cornice: HangParent): Promise<void> {
  const service = ItemLoadToSceneService.getInstance();

  if (!service) {
    return Promise.resolve();
  }

  return service.placeItemToScene({
    id: 'curtains',
    label: 'Curtains',
    draggable: false,
    load: () => Curtains.load({ targetWidth: 1.7 }),
    placeOnScene: (loaded) => {
      // Attach under the cornice (inherits window orientation).
      loaded.hangFromRod({ x: 1.0, z: 0.08, gap: 0.02 });
      cornice.add(loaded);
    },
  });
}

export function placeLustre(model: string): Promise<void> {
  const service = ItemLoadToSceneService.getInstance();

  if (!service) {
    return Promise.resolve();
  }

  return service.placeItemToScene({
    id: 'lamp',
    label: 'Lustre',
    model,
    draggable: false,
    load: () =>
      Lustre.load({
        model,
        targetWidth: 0.85,
      }),
    placeOnScene: (loaded, { room }) => {
      loaded.hangFromCeiling({ ceilingY: room.height, gap: 0.04 });
    },
  });
}

export { animate } from './animate';
export type { AnimateSceneOptions } from './animate';


import { Abazure, DEFAULT_ABAZURE_MODEL } from '@/furniture/abazure';
import { Curtains } from '@/furniture/curtains';
import { Lustre } from '@/furniture/lustre';
import { DEFAULT_SOFA_MODEL, Sofa } from '@/furniture/sofa';
import { DEFAULT_TABLE_MODEL, Table } from '@/furniture/table';
import type { AttachParent } from '@/scene/types';

import {
  ItemLoadToSceneService,
  placeFloorItemAgainstBackWall,
  placeFloorItemInCenter,
} from '../services';

/** Default room furniture seeded once when the scene mounts. */
export async function placeDefaultFurniture(options: {
  lustreModel: string;
  cornice: AttachParent;
}): Promise<void> {
  const { lustreModel, cornice } = options;

  await Promise.all([
    placeCurtains(cornice),
    placeLustre(lustreModel),
    placeSofa(),
    placeTable(),
    placeAbazure(),
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

export function placeTable(
  model?: string,
  replace = false,
): Promise<void> {
  const service = ItemLoadToSceneService.getInstance();

  if (!service) {
    return Promise.resolve();
  }

  const resolvedModel = model ?? DEFAULT_TABLE_MODEL;

  return service.placeItemToScene({
    id: 'table',
    label: 'Table',
    model: resolvedModel,
    replace,
    load: () =>
      Table.load({
        model: model ?? undefined,
        targetWidth: 1.1,
      }),
    placeOnScene: (loaded, ctx) => {
      placeFloorItemInCenter(loaded, ctx);
    },
  });
}

export function placeAbazure(
  model?: string,
  replace = false,
): Promise<void> {
  const service = ItemLoadToSceneService.getInstance();

  if (!service) {
    return Promise.resolve();
  }

  const resolvedModel = model ?? DEFAULT_ABAZURE_MODEL;

  return service.placeItemToScene({
    id: 'lamp',
    label: 'Lamp',
    model: resolvedModel,
    replace,
    load: () =>
      Abazure.load({
        model: model ?? undefined,
        targetWidth: 0.5,
      }),
    placeOnScene: (loaded, ctx) => {
      placeFloorItemAgainstBackWall(loaded, ctx);

      // Keep the default lamp clear of the centered sofa.
      if (!ctx.previousPosition) {
        loaded.position.x = ctx.room.width * 0.28;
      }
    },
  });
}

export function placeCurtains(cornice: AttachParent): Promise<void> {
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
    id: 'lustre',
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

export { animate } from './animations';
export { resolveFurnitureSelection } from './resolvers';


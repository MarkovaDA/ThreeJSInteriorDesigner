import { Furniture } from './furniture';
import type { AbazureOptions } from './types';
import { resolveModelUrl } from './utils';

export const DEFAULT_ABAZURE_MODEL = 'wooden_floor_lamp.glb';

export class Abazure extends Furniture {
  private constructor() {
    super('Abazure');
  }

  static async load({
    model,
    targetWidth = 0.5,
  }: AbazureOptions = {}): Promise<Abazure> {
    const abazure = new Abazure();

    await abazure.attachGltfModel({
      url: resolveModelUrl('abazure', model, DEFAULT_ABAZURE_MODEL),
      rootName: 'Abazure',
      targetWidth,
      normalize: 'floor',
    });

    return abazure;
  }
}

export type { AbazureOptions } from './types';

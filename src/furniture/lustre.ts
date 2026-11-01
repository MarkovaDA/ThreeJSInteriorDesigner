import { Furniture } from './furniture';
import type { LustreOptions } from './types';
import { resolveModelUrl } from './utils';

const DEFAULT_MODEL = 'red_cuisine.glb';

export class Lustre extends Furniture {
  private constructor() {
    super('Lustre');
  }

  static async load({
    model = DEFAULT_MODEL,
    targetWidth = 0.9,
  }: LustreOptions = {}): Promise<Lustre> {
    const lustre = new Lustre();

    await lustre.attachGltfModel({
      url: resolveModelUrl('lustre', model),
      rootName: model.replace(/\.glb$/i, ''),
      targetWidth,
      normalize: 'ceiling',
    });

    return lustre;
  }

  /** Hang so the top of the model sits just under the ceiling. */
  hangFromCeiling({
    x = 0,
    z = 0,
    ceilingY,
    gap = 0.02,
  }: {
    x?: number;
    z?: number;
    ceilingY: number;
    gap?: number;
  }): void {
    this.hangUnder({ x, z, y: ceilingY, gap });
  }
}

export type { LustreOptions } from './types';

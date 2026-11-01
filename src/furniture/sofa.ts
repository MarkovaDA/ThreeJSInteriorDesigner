import { Furniture } from './furniture';
import type { SofaOptions } from './types';
import { resolveModelUrl } from './utils';

export const DEFAULT_SOFA_MODEL = 'sofa_orange_modern.glb';

export class Sofa extends Furniture {
  private constructor() {
    super('Sofa');
  }

  static async load({
    model,
    targetWidth = 2.2,
  }: SofaOptions = {}): Promise<Sofa> {
    const sofa = new Sofa();

    await sofa.attachGltfModel({
      url: resolveModelUrl('sofa', model, DEFAULT_SOFA_MODEL),
      rootName: 'Sofa',
      targetWidth,
      normalize: 'floor',
    });

    return sofa;
  }
}

export type { SofaOptions } from './types';

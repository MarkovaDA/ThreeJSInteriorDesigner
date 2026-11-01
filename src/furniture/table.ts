import { Furniture } from './furniture';
import type { TableOptions } from './types';
import { resolveModelUrl } from './utils';

export const DEFAULT_TABLE_MODEL = 'amalfi_side_table_rd_510.glb';

export class Table extends Furniture {
  private constructor() {
    super('Table');
  }

  static async load({
    model,
    targetWidth = 1.1,
  }: TableOptions = {}): Promise<Table> {
    const table = new Table();

    await table.attachGltfModel({
      url: resolveModelUrl('table', model, DEFAULT_TABLE_MODEL),
      rootName: 'Table',
      targetWidth,
      normalize: 'floor',
    });

    return table;
  }
}

export type { TableOptions } from './types';

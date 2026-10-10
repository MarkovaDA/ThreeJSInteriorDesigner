import type { FurnitureModelChoice } from '../furniture/types';

export async function loadCategoryModels(
  variantsDir: string,
): Promise<FurnitureModelChoice[]> {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;

  const url = `${base}${variantsDir.replace(/^\/+/, '')}/index.json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load models from ${url} (${response.status})`);
  }

  const payload: unknown = await response.json();

  if (!Array.isArray(payload)) {
    throw new Error(`Unexpected models payload from ${url}`);
  }

  return payload.filter(isFurnitureModelChoice);
}

function isFurnitureModelChoice(value: unknown): value is FurnitureModelChoice {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const entry = value as Record<string, unknown>;

  return (
    typeof entry.id === 'string' &&
    typeof entry.label === 'string' &&
    typeof entry.file === 'string'
  );
}

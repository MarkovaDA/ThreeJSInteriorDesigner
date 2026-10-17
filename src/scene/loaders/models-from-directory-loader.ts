import type { FurnitureModelChoice } from '@/furniture/types';

/**
 * Loads the model catalog from a public directory.
 *
 * Resolves `{BASE_URL}/{directory}/index.json` (served by the Vite
 * furniture-catalog plugin from `public/…`) and keeps only well-formed
 * entries.
 *
 * @param directory - Public folder with `.glb` variants, e.g. `furniture/sofa`.
 * @returns List of choices `{ id, label, file }` for the panel / scene loader.
 *   Invalid array items are skipped; an empty array means no usable models.
 * @throws If the request fails or the JSON root is not an array.
 */
export async function loadModelsFromDirectory(
  directory: string,
): Promise<FurnitureModelChoice[]> {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;

  const url = `${base}${directory.replace(/^\/+/, '')}/index.json`;
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

/** Narrows JSON entries to `{ id, label, file }` model choices. */
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

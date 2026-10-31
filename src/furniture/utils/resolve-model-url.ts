/** Builds a public URL for a furniture `.glb` under `/furniture/<folder>/`. */
export function resolveModelUrl(
  folder: string,
  model?: string,
  defaultModel?: string,
): string {
  const file = model?.trim()
    ? model.endsWith('.glb')
      ? model
      : `${model}.glb`
    : defaultModel;

  if (!file) {
    throw new Error(`Model is required for furniture/${folder}`);
  }

  return `${import.meta.env.BASE_URL}furniture/${folder}/${file}`;
}

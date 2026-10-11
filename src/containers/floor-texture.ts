import {
  RepeatWrapping,
  SRGBColorSpace,
  TextureLoader,
  type Texture,
} from 'three';

/** Photo-based floor maps in `public/textures/floor/`. */
export type FloorTextureKind = 'herringbone' | 'oak' | 'planks';

const FLOOR_TEXTURE_FILES: Record<FloorTextureKind, string> = {
  /** Antique herringbone parquet (Poly Haven `herringbone_parquet`). */
  herringbone: 'textures/floor/herringbone_parquet_diff_1k.jpg',
  /** Warmer oak boards (Poly Haven `wooden_floor_02`). */
  oak: 'textures/floor/wooden_floor_02_diff_1k.jpg',
  /** Classic long-plank wood floor (Poly Haven `wood_floor`). */
  planks: 'textures/floor/wood_floor_diff_1k.jpg',
};

/** Real-world width of the source texture tile, in meters. */
const FLOOR_TEXTURE_TILE_METERS: Record<FloorTextureKind, number> = {
  herringbone: 3.4,
  oak: 1.9,
  planks: 1.7,
};

export type FloorTextureOptions = {
  kind?: FloorTextureKind;
  /** Room width in meters — used to set UV repeat. */
  width?: number;
  /** Room depth in meters — used to set UV repeat. */
  depth?: number;
};

function resolvePublicUrl(relativePath: string): string {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;

  return `${base}${relativePath.replace(/^\/+/, '')}`;
}

/** Load a photo floor texture with tiling matched to the room size. */
export function createFloorTexture({
  kind = 'herringbone',
  width = 8,
  depth = 8,
}: FloorTextureOptions = {}): Texture {
  const tileMeters = FLOOR_TEXTURE_TILE_METERS[kind];
  const loader = new TextureLoader();
  const texture = loader.load(resolvePublicUrl(FLOOR_TEXTURE_FILES[kind]));

  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(width / tileMeters, depth / tileMeters);
  texture.anisotropy = 8;
  texture.needsUpdate = true;

  return texture;
}

export const FLOOR_TEXTURE_KINDS: FloorTextureKind[] = [
  'herringbone',
  'oak',
  'planks',
];

/**
 * Scene size / model constants as enum-like `as const` objects.
 * (Classic `enum` is blocked by `erasableSyntaxOnly` in tsconfig.)
 */

/** Room box size in meters. */
export const RoomSize = {
  Width: 8,
  Height: 3.2,
  Depth: 8,
} as const;

export const WindowSize = {
  Width: 2.6,
  Height: 2.0,
} as const;

export const DoorSize = {
  Width: 1.0,
  Height: 2.2,
} as const;

/** Default GLB under `public/furniture/lustre/`. */
export const LustreModel = {
  Default: 'red_cuisine.glb',
} as const;

/** Target width along the longest horizontal axis, in meters. */
export const FurnitureTargetWidth = {
  Sofa: 2.4,
  Curtains: 1.7,
  Lustre: 0.85,
} as const;

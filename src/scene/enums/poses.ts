/**
 * Default poses for the room layout and fixed decoration.
 *
 * Room sits on y = 0, centered on XZ.
 * Walls: +X right (window), -X left (door), -Z back (sofa).
 */

export const WindowPose = {
  /** Inset from the +X wall toward the room interior. */
  WallInset: 0.12,
  Y: -0.15,
  Z: 0,
  /** Face into the room (-X). */
  RotationY: -Math.PI / 2,
} as const;

export const CornicePose = {
  /** Local to the window: just above the frame, toward the room. */
  YFromWindowTop: -0.02,
  Z: 0.1,
  /** Extra length beyond the window width. */
  WidthPadding: 0.55,
} as const;

export const DoorPose = {
  /** Inset from the -X wall toward the room interior. */
  WallInset: 0.02,
  Z: 0,
  /** Face into the room (+X). */
  RotationY: Math.PI / 2,
} as const;

export const CurtainsHang = {
  X: 1.0,
  Z: 0.08,
  Gap: 0.02,
} as const;

export const LustreHang = {
  X: 0,
  Z: 0,
  Gap: 0.04,
} as const;

export const SofaPose = {
  FloorY: 0,
  /** Face into the room; back against the -Z wall. */
  RotationY: 0,
} as const;

export const ViewTarget = {
  /** Lift orbit target slightly above room center. */
  YOffset: 0.35,
} as const;

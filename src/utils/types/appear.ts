export type AppearAnimation = {
  cancel: () => void;
  finished: Promise<void>;
};

export type AppearAnimationOptions = {
  durationMs?: number;
  /** Start scale as a fraction of the final scale. */
  fromScale?: number;
  /** Extra lift below the final Y that eases to zero. */
  lift?: number;
};

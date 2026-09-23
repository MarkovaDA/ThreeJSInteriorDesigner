export type Vec3 = [number, number, number];

export type AmbientLightOptions = {
  color?: number;
  intensity?: number;
};

export type HemisphereLightOptions = {
  skyColor?: number;
  groundColor?: number;
  intensity?: number;
};

export type SunLightOptions = {
  color?: number;
  intensity?: number;
  position?: Vec3;
  castShadow?: boolean;
  shadowMapSize?: number;
  shadowSize?: number;
};

export type FillLightOptions = {
  color?: number;
  intensity?: number;
  distance?: number;
  decay?: number;
  position?: Vec3;
};

export type LightingOptions = {
  ambient?: AmbientLightOptions;
  hemisphere?: HemisphereLightOptions;
  sun?: SunLightOptions;
  fill?: FillLightOptions;
};

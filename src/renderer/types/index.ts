import type { ToneMapping } from 'three';

export type RendererOptions = {
  container?: HTMLElement;
  width?: number;
  height?: number;
  antialias?: boolean;
  shadows?: boolean;
  exposure?: number;
  pixelRatio?: number;
  toneMapping?: ToneMapping;
};

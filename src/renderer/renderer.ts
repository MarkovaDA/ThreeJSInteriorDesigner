import {
  ACESFilmicToneMapping,
  PCFSoftShadowMap,
  WebGLRenderer,
} from 'three';
import type { RendererOptions } from './types';

export class Renderer extends WebGLRenderer {
  #container: HTMLElement | null = null;

  constructor({
    container,
    width,
    height,
    antialias = true,
    shadows = true,
    exposure = 1.1,
    pixelRatio = Math.min(window.devicePixelRatio, 2),
    toneMapping = ACESFilmicToneMapping,
  }: RendererOptions = {}) {
    super({ antialias });

    this.setPixelRatio(pixelRatio);
    this.shadowMap.enabled = shadows;
    this.shadowMap.type = PCFSoftShadowMap;
    this.toneMapping = toneMapping;
    this.toneMappingExposure = exposure;

    if (container) {
      this.mount(container, width, height);
    } else if (width != null && height != null) {
      this.resize(width, height);
    }
  }

  mount(
    container: HTMLElement,
    width: number = container.clientWidth,
    height: number = container.clientHeight,
  ): void {
    this.#container = container;
    this.resize(width, height);
    container.appendChild(this.domElement);
  }

  resize(width: number, height: number): void {
    this.setSize(width, height);
  }

  unmount(): void {
    if (this.#container?.contains(this.domElement)) {
      this.#container.removeChild(this.domElement);
    }
    this.#container = null;
    this.dispose();
  }
}

export type { RendererOptions } from './types';

import { Color, Object3D, Scene as ThreeScene } from 'three';
import { Camera, OrbitModelZoom, type ModelZoom } from '../camera';
import { Controls, FurnitureDragControls } from '../controls';
import type { Curtains } from '../furniture/curtains';
import type { Lustre } from '../furniture/lustre';
import type { Sofa } from '../furniture/sofa';
import { Lighting } from '../meshs/lighting';
import { Renderer } from '../renderer/renderer';
import {
  createFurnitureLoadingNotifier,
  type FurnitureLoadingNotifier,
  type LoadFurnitureResult,
} from '../utils/loaders';
import { LustreModel, RoomSize, ViewTarget } from './enums';
import { placeSofa } from './items';
import type { SceneCallbacks, SceneFurnitureSelection } from './types';
import {
  createWorldShell,
  loadCurtains,
  loadLustre,
  type WorldShell,
} from './world';

export type SceneRuntimeOptions = {
  container: HTMLDivElement;
  lustreModel?: string;
  /** Latest callbacks; read on each event so React props stay fresh. */
  getCallbacks: () => SceneCallbacks;
};

function selectionFromObject(target: Object3D): SceneFurnitureSelection {
  const id =
    typeof target.userData.furnitureId === 'string'
      ? target.userData.furnitureId
      : target.name || 'furniture';
  const label =
    typeof target.userData.label === 'string'
      ? target.userData.label
      : target.name || 'Furniture';

  return { id, label };
}

/**
 * Glue between React and Three.js:
 * builds the world, places items, runs the loop, disposes everything.
 */
export class SceneRuntime {
  readonly scene: ThreeScene;
  readonly modelZoom: ModelZoom;

  #container: HTMLDivElement;
  #shell: WorldShell;
  #camera: Camera;
  #renderer: Renderer;
  #controls: Controls;
  #dragControls: FurnitureDragControls;
  #loading: FurnitureLoadingNotifier;

  #cancelled = false;
  #loadToken = 0;
  #loadingSofa = false;
  #sofa: Sofa | null = null;
  #sofaAppear: LoadFurnitureResult<Sofa> | null = null;
  #curtains: Curtains | null = null;
  #curtainsAppear: LoadFurnitureResult<Curtains> | null = null;
  #lustre: Lustre | null = null;
  #lustreAppear: LoadFurnitureResult<Lustre> | null = null;
  #frameId = 0;

  constructor({
    container,
    lustreModel = LustreModel.Default,
    getCallbacks,
  }: SceneRuntimeOptions) {
    this.#container = container;

    const width = container.clientWidth;
    const height = container.clientHeight;

    this.scene = new ThreeScene();
    this.scene.background = new Color(0xd4dde8);

    this.#shell = createWorldShell({
      width: RoomSize.Width,
      height: RoomSize.Height,
      depth: RoomSize.Depth,
    });
    const room = this.#shell.room;

    this.#camera = new Camera({ aspect: width / height });
    const viewTarget = room.center.clone();
    viewTarget.y += ViewTarget.YOffset;
    this.#camera.lookAt(viewTarget);

    this.#renderer = new Renderer({
      container,
      width,
      height,
      antialias: true,
      shadows: true,
      exposure: 1.1,
    });

    this.#controls = new Controls(this.#camera, this.#renderer.domElement, {
      target: viewTarget,
    });

    this.modelZoom = new OrbitModelZoom(this.#camera, this.#controls);
    this.modelZoom.saveHome();
    getCallbacks().onModelZoomReady?.(this.modelZoom);

    this.#dragControls = new FurnitureDragControls(
      this.#camera,
      this.#renderer.domElement,
      this.#controls,
      {
        floorY: 0,
        bounds: {
          minX: -room.width / 2,
          maxX: room.width / 2,
          minZ: -room.depth / 2,
          maxZ: room.depth / 2,
        },
        onSelect: (target) => {
          const { onFurnitureSelect } = getCallbacks();

          if (!target) {
            onFurnitureSelect?.(null);
            return;
          }

          this.modelZoom.fitToObject(target);
          onFurnitureSelect?.(selectionFromObject(target));
        },
      },
    );

    this.scene.add(new Lighting());
    this.scene.add(room);

    this.#loading = createFurnitureLoadingNotifier((state) => {
      getCallbacks().onFurnitureLoadingChange?.(state);
    });

    loadCurtains({
      cornice: this.#shell.cornice,
      loading: this.#loading,
      isCancelled: () => this.#cancelled,
      onObject: (curtains) => {
        this.#curtains = curtains;
      },
      onReady: (result) => {
        this.#curtainsAppear = result;
      },
    });

    loadLustre({
      scene: this.scene,
      room,
      model: lustreModel,
      loading: this.#loading,
      isCancelled: () => this.#cancelled,
      onObject: (lustre) => {
        this.#lustre = lustre;
      },
      onReady: (result) => {
        this.#lustreAppear = result;
      },
    });

    this.#animate();
    window.addEventListener('resize', this.#onResize);
  }

  /** Places a catalog item; currently only sofa is supported. */
  async placeFurniture(
    id: string,
    model: string | null = null,
    replace = false,
  ): Promise<void> {
    if (id !== 'sofa') {
      return;
    }

    if (this.#sofa && !replace) {
      return;
    }

    if (this.#loadingSofa && !replace) {
      return;
    }

    this.#loadingSofa = true;
    const loadToken = ++this.#loadToken;

    this.#sofaAppear?.cancel();
    this.#sofaAppear = null;

    try {
      const result = await placeSofa(
        {
          scene: this.scene,
          room: this.#shell.room,
          loading: this.#loading,
          dragControls: this.#dragControls,
          getSofa: () => this.#sofa,
          setSofa: (sofa) => {
            this.#sofa = sofa;
          },
          isCancelled: () =>
            this.#cancelled || loadToken !== this.#loadToken,
        },
        { model },
      );

      if (!result) {
        if (loadToken === this.#loadToken) {
          this.#loadingSofa = false;
        }

        return;
      }

      this.#sofaAppear = result;
      this.#loadingSofa = false;

      await result.finished;

      if (
        this.#cancelled ||
        loadToken !== this.#loadToken ||
        this.#sofa !== result.object
      ) {
        return;
      }

      this.#dragControls.addTarget(result.object);
      this.#sofaAppear = null;
    } catch (error) {
      console.error('Failed to load sofa model:', error);

      if (loadToken === this.#loadToken) {
        this.#loadingSofa = false;
      }
    }
  }

  placeDefaultSofa(): void {
    void this.placeFurniture('sofa');
  }

  dispose(): void {
    this.#cancelled = true;
    this.#loadToken += 1;
    this.#loadingSofa = false;
    this.#loading.clear();
    this.#sofaAppear?.cancel();
    this.#sofaAppear = null;
    this.#curtainsAppear?.cancel();
    this.#lustreAppear?.cancel();
    cancelAnimationFrame(this.#frameId);
    window.removeEventListener('resize', this.#onResize);

    this.#dragControls.dispose();
    this.#controls.dispose();
    this.#curtains?.dispose();
    this.#lustre?.dispose();
    this.#lustre = null;
    this.#sofa?.dispose();
    this.#sofa = null;
    this.#shell.dispose();
    this.#renderer.unmount();
  }

  #animate = (): void => {
    this.#frameId = requestAnimationFrame(this.#animate);
    this.#controls.update();
    this.#dragControls.update();
    this.#renderer.render(this.scene, this.#camera);
  };

  #onResize = (): void => {
    const w = this.#container.clientWidth;
    const h = this.#container.clientHeight;
    this.#camera.resize(w, h);
    this.#renderer.resize(w, h);
  };
}

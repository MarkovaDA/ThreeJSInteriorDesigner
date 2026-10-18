import { Box3, Object3D, Scene as ThreeScene } from 'three';
import { Room } from '@/containers/room';
import {
  loadFurniture,
  type FurnitureLoadingNotifier,
  type LoadFurnitureResult,
} from '@/scene/loaders';

import { tryDispose } from '@/scene/loaders/try-dispose';

import type {
  ItemLoadToSceneServiceOptions,
  ItemPlaceContext,
  ItemPlaceOptions,
} from '@/scene/types';

/** Loads, places, replaces, and optionally wires drag for an item on the scene. */
export class ItemLoadToSceneService {
  private static instance?: ItemLoadToSceneService;

  private readonly scene: ThreeScene;
  private readonly room: Room;
  private readonly loading: FurnitureLoadingNotifier;
  private readonly getDragControls: ItemLoadToSceneServiceOptions['getDragControls'];
  private readonly isCancelled: ItemLoadToSceneServiceOptions['isCancelled'];

  private readonly items = new Map<string, Object3D>();
  private readonly loadingIds = new Set<string>();
  private readonly loadTokens = new Map<string, number>();
  private readonly appears = new Map<string, LoadFurnitureResult<Object3D>>();

  private constructor({
    scene,
    room,
    loading,
    getDragControls,
    isCancelled,
  }: ItemLoadToSceneServiceOptions) {
    this.scene = scene;
    this.room = room;
    this.loading = loading;
    this.getDragControls = getDragControls;
    this.isCancelled = isCancelled;
  }

  /** Creates (or replaces) the singleton bound to the current scene. */
  static init(options: ItemLoadToSceneServiceOptions): ItemLoadToSceneService {
    ItemLoadToSceneService.instance?.dispose();
    ItemLoadToSceneService.instance = new ItemLoadToSceneService(options);

    return ItemLoadToSceneService.instance;
  }

  /** Returns the active singleton, if `init` has been called. */
  static getInstance(): ItemLoadToSceneService | undefined {
    return ItemLoadToSceneService.instance;
  }

  getItem(id: string): Object3D | undefined {
    return this.items.get(id);
  }

  /** Loads an item by params and places it on the scene. */
  async placeItemToScene<T extends Object3D>({
    id,
    label,
    model,
    replace = false,
    load,
    placeOnScene,
    draggable = true,
  }: ItemPlaceOptions<T>): Promise<void> {
    const current = this.items.get(id);

    if (current && !replace) {
      return;
    }

    if (this.loadingIds.has(id) && !replace) {
      return;
    }

    this.loadingIds.add(id);
    const loadToken = (this.loadTokens.get(id) ?? 0) + 1;
    this.loadTokens.set(id, loadToken);

    const previous = current;
    const previousPosition = previous?.position.clone();
    const previousRotationY = previous?.rotation.y ?? 0;

    this.appears.get(id)?.cancel();
    this.appears.delete(id);

    try {
      const result = await loadFurniture({
        id,
        label,
        loading: this.loading,
        isCancelled: () =>
          this.isCancelled() ||
          this.loadTokens.get(id) !== loadToken ||
          !this.scene,
        load,
        onLoaded: async (loaded) => {
          if (previous) {
            this.getDragControls()?.removeTarget(previous);
            this.scene.remove(previous);
            tryDispose(previous);
          }

          this.items.set(id, loaded);
          loaded.userData.furnitureId = id;
          loaded.userData.label = label;

          if (model !== undefined) {
            loaded.userData.model = model;
          }

          await placeOnScene(loaded, {
            scene: this.scene,
            room: this.room,
            previous,
            previousPosition,
            previousRotationY,
          });

          if (!loaded.parent) {
            this.scene.add(loaded);
          }
        },
      });

      if (!result) {
        if (this.loadTokens.get(id) === loadToken) {
          this.loadingIds.delete(id);
        }

        return;
      }

      this.appears.set(id, result);
      this.loadingIds.delete(id);

      await result.finished;

      if (
        this.isCancelled() ||
        this.loadTokens.get(id) !== loadToken ||
        this.items.get(id) !== result.object
      ) {
        return;
      }

      if (draggable) {
        this.getDragControls()?.addTarget(result.object);
      }

      this.appears.delete(id);
    } catch (error) {
      console.error(`Failed to load ${label} model:`, error);

      if (this.loadTokens.get(id) === loadToken) {
        this.loadingIds.delete(id);
      }
    }
  }

  /** Cancels in-flight loads/appears, disposes items, and clears the singleton. */
  dispose(): void {
    for (const id of this.loadTokens.keys()) {
      this.loadTokens.set(id, (this.loadTokens.get(id) ?? 0) + 1);
    }

    this.loadingIds.clear();

    for (const appear of this.appears.values()) {
      appear.cancel();
    }

    this.appears.clear();

    for (const item of this.items.values()) {
      this.getDragControls()?.removeTarget(item);
      item.removeFromParent();
      tryDispose(item);
    }

    this.items.clear();

    if (ItemLoadToSceneService.instance === this) {
      ItemLoadToSceneService.instance = undefined;
    }
  }
}

/** Places a floor item against the -Z wall (default sofa layout). */
export function placeFloorItemAgainstBackWall(
  object: Object3D & { placeOnFloor: (floorY: number) => void },
  {
    room,
    previousPosition,
    previousRotationY,
  }: Pick<ItemPlaceContext, 'room' | 'previousPosition' | 'previousRotationY'>,
): void {
  if (previousPosition) {
    object.position.copy(previousPosition);
    object.rotation.y = previousRotationY;
    object.placeOnFloor(0);
    return;
  }

  // World space: room sits on y = 0, centered on XZ.
  object.position.set(0, 0, 0);
  object.placeOnFloor(0);
  // Face into the room; back against the -Z wall.
  object.rotation.y = 0;

  object.updateMatrixWorld(true);
  const box = new Box3().setFromObject(object);
  object.position.z += -room.depth / 2 - box.min.z;
}

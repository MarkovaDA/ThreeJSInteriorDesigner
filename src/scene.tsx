import { useEffect, useRef } from 'react';
import { Box3, Color, Scene as ThreeScene } from 'three';
import { Camera, OrbitModelZoom, type ModelZoom } from './camera';
import { Controls, FurnitureDragControls } from './controls';
import { RoomDoor } from './containers/door';
import { Room } from './containers/room';
import { RoomWindow } from './containers/window';
import { Curtains } from './furniture/curtains';
import { Cornice } from './furniture/cornice';
import { Lustre } from './furniture/lustre';
import { DEFAULT_SOFA_MODEL, Sofa } from './furniture/sofa';
import type { SceneProps } from './furniture/types';
import { Lighting } from './meshs/lighting';
import { Renderer } from './renderer/renderer';
import {
  createFurnitureLoadingNotifier,
  loadFurnitureObject,
  type FurnitureLoadingNotifier,
  type LoadFurnitureResult,
} from './utils/loaders';

export default function Scene({
  selectedFurnitureId = null,
  furnitureRequestId = 0,
  sofaModel = null,
  lustreModel = 'red_cuisine.glb',
  onFurnitureSelect,
  onFurnitureLoadingChange,
  onModelZoomReady,
}: SceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<ThreeScene | null>(null);
  const roomRef = useRef<Room | null>(null);
  const sofaRef = useRef<Sofa | null>(null);
  const dragControlsRef = useRef<FurnitureDragControls | null>(null);
  const modelZoomRef = useRef<ModelZoom | null>(null);
  const cancelledRef = useRef(false);
  const loadingSofaRef = useRef(false);
  const loadTokenRef = useRef(0);
  const sofaAppearRef = useRef<LoadFurnitureResult<Sofa> | null>(null);
  const pendingFurnitureIdRef = useRef<string | null>(null);
  const onFurnitureSelectRef = useRef(onFurnitureSelect);
  const onModelZoomReadyRef = useRef(onModelZoomReady);
  const onFurnitureLoadingChangeRef = useRef(onFurnitureLoadingChange);
  const lustreModelRef = useRef(lustreModel);
  const loadingNotifierRef = useRef<FurnitureLoadingNotifier | null>(null);

  onFurnitureSelectRef.current = onFurnitureSelect;
  onFurnitureLoadingChangeRef.current = onFurnitureLoadingChange;
  onModelZoomReadyRef.current = onModelZoomReady;
  lustreModelRef.current = lustreModel;

  if (!loadingNotifierRef.current) {
    loadingNotifierRef.current = createFurnitureLoadingNotifier((state) => {
      onFurnitureLoadingChangeRef.current?.(state);
    });
  }

  const placeFurnitureRef = useRef<
    (id: string, model?: string | null, replace?: boolean) => Promise<void>
  >(async () => {});

  placeFurnitureRef.current = async (
    id: string,
    model: string | null = null,
    replace = false,
  ) => {
    if (id !== 'sofa') {
      return;
    }

    const scene = sceneRef.current;
    const room = roomRef.current;
    const loading = loadingNotifierRef.current;

    if (!scene || !room || !loading) {
      pendingFurnitureIdRef.current = id;
      return;
    }

    if (sofaRef.current && !replace) {
      return;
    }

    if (loadingSofaRef.current && !replace) {
      return;
    }

    loadingSofaRef.current = true;
    const loadToken = ++loadTokenRef.current;

    const previous = sofaRef.current;
    const previousPosition = previous?.position.clone() ?? null;
    const previousRotationY = previous?.rotation.y ?? 0;

    sofaAppearRef.current?.cancel();
    sofaAppearRef.current = null;

    try {
      const result = await loadFurnitureObject({
        id: 'sofa',
        label: 'Sofa',
        loading,
        isCancelled: () =>
          cancelledRef.current ||
          loadToken !== loadTokenRef.current ||
          !sceneRef.current,
        load: () =>
          Sofa.load({
            model: model ?? undefined,
            targetWidth: 2.4,
          }),
        onLoaded: (loaded) => {
          if (previous) {
            dragControlsRef.current?.removeTarget(previous);
            scene.remove(previous);
            previous.dispose();
          }

          sofaRef.current = loaded;
          loaded.userData.furnitureId = 'sofa';
          loaded.userData.label = 'Sofa';
          loaded.userData.model = model ?? DEFAULT_SOFA_MODEL;

          if (previousPosition) {
            loaded.position.copy(previousPosition);
            loaded.rotation.y = previousRotationY;
            loaded.placeOnFloor(0);
          } else {
            // World space: room sits on y = 0, centered on XZ.
            loaded.position.set(0, 0, 0);
            loaded.placeOnFloor(0);
            // Face into the room; back against the -Z wall.
            loaded.rotation.y = 0;

            loaded.updateMatrixWorld(true);
            const sofaBox = new Box3().setFromObject(loaded);
            loaded.position.z += -room.depth / 2 - sofaBox.min.z;
          }

          scene.add(loaded);
        },
      });

      if (!result) {
        if (loadToken === loadTokenRef.current) {
          loadingSofaRef.current = false;
        }

        return;
      }

      sofaAppearRef.current = result;
      loadingSofaRef.current = false;

      await result.finished;

      if (
        cancelledRef.current ||
        loadToken !== loadTokenRef.current ||
        sofaRef.current !== result.object
      ) {
        return;
      }

      dragControlsRef.current?.addTarget(result.object);
      sofaAppearRef.current = null;
    } catch (error) {
      console.error('Failed to load sofa model:', error);

      if (loadToken === loadTokenRef.current) {
        loadingSofaRef.current = false;
      }
    }
  };

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    cancelledRef.current = false;
    loadingSofaRef.current = false;

    let curtains: Curtains | null = null;
    let lustre: Lustre | null = null;
    let curtainsAppear: LoadFurnitureResult<Curtains> | null = null;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new ThreeScene();
    scene.background = new Color(0xd4dde8);
    sceneRef.current = scene;

    const room = new Room({ width: 8, height: 3.2, depth: 8 });
    roomRef.current = room;

    const camera = new Camera({ aspect: width / height });
    const viewTarget = room.center.clone();
    viewTarget.y += 0.35;
    camera.lookAt(viewTarget);

    const renderer = new Renderer({
      container,
      width,
      height,
      antialias: true,
      shadows: true,
      exposure: 1.1,
    });

    const controls = new Controls(camera, renderer.domElement, {
      target: viewTarget,
    });

    const modelZoom = new OrbitModelZoom(camera, controls);
    modelZoom.saveHome();
    modelZoomRef.current = modelZoom;
    onModelZoomReadyRef.current?.(modelZoom);

    const dragControls = new FurnitureDragControls(
      camera,
      renderer.domElement,
      controls,
      {
        floorY: 0,
        bounds: {
          minX: -room.width / 2,
          maxX: room.width / 2,
          minZ: -room.depth / 2,
          maxZ: room.depth / 2,
        },
        onSelect: (target) => {
          if (!target) {
            onFurnitureSelectRef.current?.(null);

            return;
          }

          const id =
            typeof target.userData.furnitureId === 'string'
              ? target.userData.furnitureId
              : target.name || 'furniture';
          const label =
            typeof target.userData.label === 'string'
              ? target.userData.label
              : target.name || 'Furniture';

          modelZoomRef.current?.fitToObject(target);
          onFurnitureSelectRef.current?.({ id, label });
        },
      },
    );

    dragControlsRef.current = dragControls;

    const lighting = new Lighting({
      ambient: { color: 0xfff6ee, intensity: 0.55 },
      hemisphere: {
        skyColor: 0xe8f0ff,
        groundColor: 0xc4a882,
        intensity: 0.4,
      },
      sun: {
        color: 0xfff2dd,
        intensity: 1.2,
        position: [4, 8, 5],
        castShadow: true,
      },
      fill: {
        color: 0xffe8d0,
        intensity: 12,
        distance: 14,
        decay: 2,
        position: [-2, 2.5, 2],
      },
    });

    const windowWidth = 2.6;
    const windowHeight = 2.0;
    const roomWindow = new RoomWindow({ width: windowWidth, height: windowHeight });

    roomWindow.position.set(room.width / 2 - 0.12, -0.15, 0);
    roomWindow.rotation.y = -Math.PI / 2;

    const cornice = new Cornice({ width: windowWidth + 0.55 });
    // Local to the window: just above the frame, toward the room.
    cornice.position.set(0, windowHeight / 2 - 0.02, 0.1);
    roomWindow.add(cornice);
    room.add(roomWindow);

    const doorHeight = 2.2;
    const roomDoor = new RoomDoor({
      width: 1.0,
      height: doorHeight,
      panelColor: 0x9a7a58,
      frameColor: 0xf5f2ec,
      handleColor: 0xc4a46a,
    });

    roomDoor.position.set(
      -room.width / 2 + 0.02,
      -room.height / 2 + doorHeight / 2,
      0,
    );

    roomDoor.rotation.y = Math.PI / 2;
    room.add(roomDoor);

    scene.add(lighting);
    scene.add(room);

    const loading = loadingNotifierRef.current;

    if (loading) {
      void loadFurnitureObject({
        id: 'curtains',
        label: 'Curtains',
        loading,
        isCancelled: () => cancelledRef.current,
        load: () => Curtains.load({ targetWidth: 1.7 }),
        onLoaded: (loaded) => {
          curtains = loaded;

          // Attach under the cornice (inherits window orientation).
          curtains.hangFromRod({ x: 1.0, z: 0.08, gap: 0.02 });
          cornice.add(curtains);
        },
      })
        .then((result) => {
          if (!result) {
            return;
          }

          curtainsAppear = result;
        })
        .catch((error: unknown) => {
          console.error('Failed to load curtains model:', error);
        });
    }

    void Lustre.load({
      model: lustreModelRef.current,
      targetWidth: 0.85,
    }).then((loaded) => {
      if (cancelledRef.current) {
        loaded.dispose();
        return;
      }

      lustre = loaded;
      lustre.userData.furnitureId = 'lamp';
      lustre.userData.label = 'Lustre';
      lustre.hangFromCeiling({ ceilingY: room.height, gap: 0.04 });
      scene.add(lustre);
    });

    let frameId = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      dragControls.update();
      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.resize(w, h);
      renderer.resize(w, h);
    };

    window.addEventListener('resize', onResize);

    const pendingId = pendingFurnitureIdRef.current;

    if (pendingId) {
      pendingFurnitureIdRef.current = null;
      void placeFurnitureRef.current(pendingId);
    } else {
      void placeFurnitureRef.current('sofa');
    }

    if (sofaRef.current) {
      dragControls.addTarget(sofaRef.current);
    }

    return () => {
      cancelledRef.current = true;
      loadTokenRef.current += 1;
      loadingSofaRef.current = false;
      loadingNotifierRef.current?.clear();
      sofaAppearRef.current?.cancel();
      sofaAppearRef.current = null;
      curtainsAppear?.cancel();
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);

      dragControls.dispose();
      dragControlsRef.current = null;
      modelZoomRef.current = null;
      controls.dispose();
      curtains?.dispose();
      lustre?.dispose();
      lustre = null;
      sofaRef.current?.dispose();
      sofaRef.current = null;
      sceneRef.current = null;
      roomRef.current = null;
      cornice.dispose();
      roomWindow.dispose();
      roomDoor.dispose();
      room.dispose();
      renderer.unmount();
    };
  }, []);

  useEffect(() => {
    if (!selectedFurnitureId || furnitureRequestId <= 0) {
      return;
    }

    void placeFurnitureRef.current(selectedFurnitureId);
  }, [selectedFurnitureId, furnitureRequestId]);

  useEffect(() => {
    if (!sofaModel) {
      return;
    }

    void placeFurnitureRef.current('sofa', sofaModel, true);
  }, [sofaModel]);

  return <div ref={containerRef} className="scene" />;
}

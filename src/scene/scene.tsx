import { useEffect, useRef } from 'react';
import type { Object3D, Scene as ThreeScene, Vector3 } from 'three';
import { Camera, OrbitModelZoom } from '@/camera';
import { Controls, FurnitureDragControls } from '@/controls';
import type { Room } from '@/containers/room';
import type {
  SceneFurnitureSelection,
  SceneProps,
} from '@/furniture/types';
import { Lighting } from '@/meshs/lighting';
import { Renderer } from '@/renderer/renderer';
import { Bootstrap } from '@/scene/bootstrap';
import { useLoadFurniture } from '@/scene/hooks';
import { ItemLoadToSceneService } from '@/scene/services';
import type { MountedScene, MountSceneOptions } from '@/scene/types';
import { animate, seedDefaultFurniture } from '@/scene/utils';

function resolveFurnitureSelection(
  target: Object3D,
): SceneFurnitureSelection {
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

/** Boots Three.js runtime for a container and returns a dispose handle. */
function mountScene({
  container,
  loading,
  lustreModel,
  isCancelled,
  onSceneReady,
  onModelZoomReady,
  onFurnitureSelect,
}: MountSceneOptions): MountedScene {
  const width = container.clientWidth;
  const height = container.clientHeight;

  const bootstrap = new Bootstrap();
  const scene = bootstrap.initScene();

  const { room, roomWindow, cornice, roomDoor } = bootstrap.initRoom();
  const { camera, viewTarget } = addCamera(room, width / height);
  
  const renderer = new Renderer({
    container,
    width,
    height,
    antialias: true,
    shadows: true,
    exposure: 1.1,
  });

  onSceneReady(scene);

  const unbindResize = bindResizeEvents(camera, renderer);

  let dragControls: FurnitureDragControls;
  let controls: Controls;

  ItemLoadToSceneService.init({
    scene,
    room,
    loading,
    getDragControls: () => dragControls,
    isCancelled,
  });

  function addCamera(
    targetRoom: Room,
    aspect: number,
  ): { camera: Camera; viewTarget: Vector3 } {
    const nextCamera = new Camera({ aspect });
    const viewTarget = targetRoom.center.clone();
    viewTarget.y += 0.35;
    nextCamera.lookAt(viewTarget);

    return { camera: nextCamera, viewTarget };
  }

  function addControls(
    nextCamera: Camera,
    domElement: HTMLElement,
    targetRoom: Room,
    viewTarget: Vector3,
  ): {
    controls: Controls;
    modelZoom: OrbitModelZoom;
    dragControls: FurnitureDragControls;
  } {
    const nextControls = new Controls(nextCamera, domElement, {
      target: viewTarget,
    });

    const modelZoom = new OrbitModelZoom(nextCamera, nextControls);
    modelZoom.saveHome();
    onModelZoomReady(modelZoom);

    const nextDragControls = new FurnitureDragControls(
      nextCamera,
      domElement,
      nextControls,
      {
        floorY: 0,
        bounds: {
          minX: -targetRoom.width / 2,
          maxX: targetRoom.width / 2,
          minZ: -targetRoom.depth / 2,
          maxZ: targetRoom.depth / 2,
        },
        onSelect: (target) => {
          if (!target) {
            onFurnitureSelect(undefined);

            return;
          }

          modelZoom.fitToObject(target);
          onFurnitureSelect(resolveFurnitureSelection(target));
        },
      },
    );

    return {
      controls: nextControls,
      modelZoom,
      dragControls: nextDragControls,
    };
  }

  function addLightening(targetScene: ThreeScene): Lighting {
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

    targetScene.add(lighting);

    return lighting;
  }

  function bindResizeEvents(
    nextCamera: Camera,
    nextRenderer: Renderer,
  ): () => void {
    const onResize = () => {
      const nextWidth = container.clientWidth;
      const nextHeight = container.clientHeight;

      nextCamera.resize(nextWidth, nextHeight);
      nextRenderer.resize(nextWidth, nextHeight);
    };

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }

  const controlsBundle = addControls(
    camera,
    renderer.domElement,
    room,
    viewTarget,
  );

  dragControls = controlsBundle.dragControls;
  controls = controlsBundle.controls;

  addLightening(scene);

  scene.add(room);

  void seedDefaultFurniture({ lustreModel, cornice });

  const stopAnimation = animate({
    scene,
    camera,
    renderer,
    controls,
    getDragControls: () => dragControls,
  });

  return {
    dispose: () => {
      stopAnimation();
      unbindResize();

      ItemLoadToSceneService.getInstance()?.dispose();
      dragControls?.dispose();
      controls.dispose();
      cornice.dispose();
      roomWindow.dispose();
      roomDoor.dispose();
      room.dispose();
      renderer.unmount();
    },
  };
}

export default function Scene({
  selectedFurnitureId,
  furnitureRequestId = 0,
  sofaModel,
  lustreModel = 'red_cuisine.glb',
  onFurnitureSelect,
  onFurnitureLoadingChange,
  onModelZoomReady,
}: SceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<ThreeScene | undefined>(undefined);
  const cancelledRef = useRef(false);
  const lustreModelRef = useRef(lustreModel);

  const onFurnitureSelectRef = useRef(onFurnitureSelect);
  const onModelZoomReadyRef = useRef(onModelZoomReady);

  const loading = useLoadFurniture({
    selectedFurnitureId,
    furnitureRequestId,
    sofaModel,
    onFurnitureLoadingChange,
  });

  onFurnitureSelectRef.current = onFurnitureSelect;
  onModelZoomReadyRef.current = onModelZoomReady;
  lustreModelRef.current = lustreModel;

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    cancelledRef.current = false;

    const mounted = mountScene({
      container,
      loading,
      lustreModel: lustreModelRef.current,
      isCancelled: () => cancelledRef.current || !sceneRef.current,
      onSceneReady: (scene) => {
        sceneRef.current = scene;
      },
      onModelZoomReady: (zoom) => {
        onModelZoomReadyRef.current?.(zoom);
      },
      onFurnitureSelect: (selection) => {
        onFurnitureSelectRef.current?.(selection);
      },
    });

    return () => {
      cancelledRef.current = true;
      mounted.dispose();
      sceneRef.current = undefined;
    };
  }, []);

  return <div ref={containerRef} className="scene" />;
}
import { useEffect, useRef } from 'react';
import { Box3, Color, Scene as ThreeScene } from 'three';
import { Camera } from './camera/camera';
import { Controls, FurnitureDragControls } from './controls';
import { RoomDoor } from './containers/door';
import { Room } from './containers/room';
import { RoomWindow } from './containers/window';
import { Curtains } from './furniture/curtains';
import { Cornice } from './furniture/cornice';
import { Lustre } from './furniture/lustre';
import { Sofa } from './furniture/sofa';
import type { SceneProps } from './furniture/types';
import { Lighting } from './meshs/lighting';
import { Renderer } from './renderer/renderer';

export default function Scene({
  selectedFurnitureId = null,
  furnitureRequestId = 0,
  lustreModel = 'red_cuisine.glb',
  onFurnitureSelect,
}: SceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<ThreeScene | null>(null);
  const roomRef = useRef<Room | null>(null);
  const sofaRef = useRef<Sofa | null>(null);
  const dragControlsRef = useRef<FurnitureDragControls | null>(null);
  const cancelledRef = useRef(false);
  const loadingSofaRef = useRef(false);
  const loadTokenRef = useRef(0);
  const pendingFurnitureIdRef = useRef<string | null>(null);
  const onFurnitureSelectRef = useRef(onFurnitureSelect);
  const lustreModelRef = useRef(lustreModel);

  onFurnitureSelectRef.current = onFurnitureSelect;
  lustreModelRef.current = lustreModel;

  const placeFurnitureRef = useRef<(id: string) => Promise<void>>(async () => {});

  placeFurnitureRef.current = async (id: string) => {
    if (id !== 'sofa') {
      return;
    }

    const scene = sceneRef.current;
    const room = roomRef.current;

    if (!scene || !room) {
      pendingFurnitureIdRef.current = id;
      return;
    }

    if (sofaRef.current || loadingSofaRef.current) {
      return;
    }

    loadingSofaRef.current = true;
    const loadToken = ++loadTokenRef.current;

    try {
      const loaded = await Sofa.load({ targetWidth: 2.4 });

      if (
        cancelledRef.current ||
        loadToken !== loadTokenRef.current ||
        !sceneRef.current
      ) {
        loaded.dispose();
        return;
      }

      sofaRef.current = loaded;
      loaded.userData.furnitureId = 'sofa';
      loaded.userData.label = 'Sofa';
      // World space: room sits on y = 0, centered on XZ.
      loaded.position.set(0, 0, 0);
      loaded.placeOnFloor(0);
      // Back against the wall on the right when entering from the door (-Z).
      loaded.rotation.y = -Math.PI / 2;

      loaded.updateMatrixWorld(true);
      const sofaBox = new Box3().setFromObject(loaded);
      loaded.position.z += -room.depth / 2 - sofaBox.min.z;

      scene.add(loaded);
      dragControlsRef.current?.addTarget(loaded);
    } catch (error) {
      console.error('Failed to load sofa model:', error);
    } finally {
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
      panelColor: 0xc4a484,
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

    void Curtains.load({ targetWidth: 1.7 }).then((loaded) => {
      if (cancelledRef.current) {
        loaded.dispose();
        return;
      }

      curtains = loaded;

      // Attach under the cornice (inherits window orientation).
      curtains.hangFromRod({ x: 1.0, z: 0.08, gap: 0.02 });
      cornice.add(curtains);
    });

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
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      
      dragControls.dispose();
      dragControlsRef.current = null;
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

  return <div ref={containerRef} className="scene" />;
}

import { useEffect, useRef } from 'react';
import { Color, Scene as ThreeScene } from 'three';
import { Camera } from './camera/camera';
import { Controls } from './controls';
import { RoomDoor } from './containers/door';
import { Room } from './containers/room';
import { RoomWindow } from './containers/window';
import { Curtains } from './furniture/curtains';
import { Cornice } from './furniture/cornice';
import { Lighting } from './meshs/lighting';
import { Renderer } from './renderer/renderer';

export default function Scene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let curtains: Curtains | null = null;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new ThreeScene();
    scene.background = new Color(0xd4dde8);

    const room = new Room({ width: 8, height: 3.2, depth: 8 });
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
      if (cancelled) {
        loaded.dispose();
        return;
      }

      curtains = loaded;

      // Attach under the cornice (inherits window orientation).
      curtains.hangFromRod({ x: 1.0, z: 0.08, gap: 0.02 });
      cornice.add(curtains);
    });

    let frameId = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
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

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      curtains?.dispose();
      cornice.dispose();
      roomWindow.dispose();
      roomDoor.dispose();
      room.dispose();
      renderer.unmount();
    };
  }, []);

  return <div ref={containerRef} className="scene" />;
}
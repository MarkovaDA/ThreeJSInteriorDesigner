import { Color, Scene as ThreeScene } from 'three';
import { RoomDoor } from '@/containers/door';
import { Room } from '@/containers/room';
import { RoomWindow } from '@/containers/window';
import { Cornice } from '@/furniture/cornice';

import type { InitRoomResult } from './types';

/** Imperative Three.js scene lifecycle helpers used by the React Scene mount. */
export class Bootstrap {
  private static readonly WINDOW_WIDTH = 2.6;
  private static readonly WINDOW_HEIGHT = 2.0;

  scene?: ThreeScene;
  room?: Room;
  roomWindow?: RoomWindow;
  cornice?: Cornice;
  roomDoor?: RoomDoor;

  /** Creates the Three.js scene with the default background. */
  initScene(): ThreeScene {
    const scene = new ThreeScene();

    scene.background = new Color(0xd4dde8);
    this.scene = scene;

    return scene;
  }

  /** Builds the room shell: walls, window + cornice, and door. */
  initRoom(): InitRoomResult {
    this.room = new Room({ width: 8, height: 3.2, depth: 8 });

    // Window must come before cornice (cornice attaches to the window).
    this.addWindow().addCornice().addDoor();

    return {
      room: this.room,
      roomWindow: this.roomWindow!,
      cornice: this.cornice!,
      roomDoor: this.roomDoor!,
    };
  }

  /** Places the window on the +X wall, facing into the room. */
  addWindow(): this {
    const room = this.room;

    if (!room) {
      throw new Error('Bootstrap.addWindow: call initRoom first');
    }

    const roomWindow = new RoomWindow({
      width: Bootstrap.WINDOW_WIDTH,
      height: Bootstrap.WINDOW_HEIGHT,
    });

    roomWindow.position.set(room.width / 2 - 0.12, -0.15, 0);
    roomWindow.rotation.y = -Math.PI / 2;
    room.add(roomWindow);

    this.roomWindow = roomWindow;

    return this;
  }

  /** Attaches a cornice above the window frame (local to the window). */
  addCornice(): this {
    const roomWindow = this.roomWindow;

    if (!roomWindow) {
      throw new Error('Bootstrap.addCornice: call addWindow first');
    }

    const cornice = new Cornice({ width: Bootstrap.WINDOW_WIDTH + 0.55 });

    // Local to the window: just above the frame, toward the room.
    cornice.position.set(0, Bootstrap.WINDOW_HEIGHT / 2 - 0.02, 0.1);
    roomWindow.add(cornice);

    this.cornice = cornice;

    return this;
  }

  /** Places the door on the -X wall. */
  addDoor(): this {
    const room = this.room;

    if (!room) {
      throw new Error('Bootstrap.addDoor: call initRoom first');
    }

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

    this.roomDoor = roomDoor;

    return this;
  }
}

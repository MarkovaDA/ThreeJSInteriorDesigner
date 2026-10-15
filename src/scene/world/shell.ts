import { RoomDoor } from '../../containers/door';
import { Room } from '../../containers/room';
import { RoomWindow } from '../../containers/window';
import { Cornice } from '../../furniture/cornice';
import {
  CornicePose,
  DoorPose,
  DoorSize,
  RoomSize,
  WindowPose,
  WindowSize,
} from '../enums';

/** Fixed room geometry: walls box + window + door + cornice. */
export type WorldShell = {
  room: Room;
  roomWindow: RoomWindow;
  roomDoor: RoomDoor;
  cornice: Cornice;
  dispose: () => void;
};

export function createWorldShell(
  size: { width: number; height: number; depth: number } = {
    width: RoomSize.Width,
    height: RoomSize.Height,
    depth: RoomSize.Depth,
  },
): WorldShell {
  const room = new Room(size);

  const roomWindow = new RoomWindow({
    width: WindowSize.Width,
    height: WindowSize.Height,
  });

  roomWindow.position.set(
    room.width / 2 - WindowPose.WallInset,
    WindowPose.Y,
    WindowPose.Z,
  );
  roomWindow.rotation.y = WindowPose.RotationY;

  const cornice = new Cornice({
    width: WindowSize.Width + CornicePose.WidthPadding,
  });

  cornice.position.set(
    0,
    WindowSize.Height / 2 + CornicePose.YFromWindowTop,
    CornicePose.Z,
  );
  roomWindow.add(cornice);
  room.add(roomWindow);

  const roomDoor = new RoomDoor({
    width: DoorSize.Width,
    height: DoorSize.Height,
    panelColor: 0x9a7a58,
    frameColor: 0xf5f2ec,
    handleColor: 0xc4a46a,
  });

  roomDoor.position.set(
    -room.width / 2 + DoorPose.WallInset,
    -room.height / 2 + DoorSize.Height / 2,
    DoorPose.Z,
  );
  roomDoor.rotation.y = DoorPose.RotationY;
  room.add(roomDoor);

  return {
    room,
    roomWindow,
    roomDoor,
    cornice,
    dispose() {
      cornice.dispose();
      roomWindow.dispose();
      roomDoor.dispose();
      room.dispose();
    },
  };
}

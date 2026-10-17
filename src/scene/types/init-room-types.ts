import type { RoomDoor } from '@/containers/door';
import type { Room } from '@/containers/room';
import type { RoomWindow } from '@/containers/window';
import type { Cornice } from '@/furniture/cornice';

export type InitRoomResult = {
  room: Room;
  roomWindow: RoomWindow;
  cornice: Cornice;
  roomDoor: RoomDoor;
};

export type RoomOptions = {
  width?: number;
  height?: number;
  depth?: number;
  /** Photo floor map: `herringbone` (default), `oak`, or `planks`. */
  floorTexture?: 'herringbone' | 'oak' | 'planks';
}

export type WindowOptions = {
  width?: number;
  height?: number;
  frameThickness?: number;
  frameDepth?: number;
  frameColor?: number;
  glassColor?: number;
  glassEmissive?: number;
  glassOpacity?: number;
};

export type DoorOptions = {
  width?: number;
  height?: number;
  frameThickness?: number;
  frameDepth?: number;
  panelDepth?: number;
  frameColor?: number;
  panelColor?: number;
  handleColor?: number;
};

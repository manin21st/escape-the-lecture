export const TILE = 16;
export const COLS = 20;
export const ROWS = 16;
export const MAP_W = COLS * TILE; // 320
export const MAP_H = ROWS * TILE; // 256
export const GAME_W = 320;
export const GAME_H = 256;

export const DEG_TO_RAD = Math.PI / 180;

export const PAL = {
  floor:       0xd8b88a,
  floorAlt:    0xcaa97a,
  floorLine:   0xa87f55,
  wall:        0xe8d5b0,
  wallDark:    0x8b5a2b,
  wallShadow:  0x6b4423,
  desk:        0xd4a574,
  deskEdge:    0x6b4423,
  deskSurface: 0xc89a60,
  podium:      0xa87042,
  podiumEdge:  0x6b4423,
  blackboard:  0x3a5a3a,
  bbLine:      0x2a4a2a,
  uiFrame:     0x6b4423,
  uiInner:     0xf8f0d8,
  uiBorder:    0x4a2c1a,
  moveGreen:   0x6ba85a,
  stopRed:     0xc44545,
  warnYellow:  0xffdd44,
  suspOrange:  0xff9900,
  detected:    0xff3300,
  profSkin:    0xf0c89c,
  profHair:    0x8a8a8a,
  profSuit:    0x2c2c3a,
  taHoodie:    0x6abaa8,
  npcSkin:     0xf0c8a0,
  exitGreen:   0x44cc44,
  exitBorder:  0x228822,
  playerBag:   0x6ba85a,
  friendHeart: 0xff4466,
  friendSnitch:0xcc2222,
};

export const FONTS = {
  heading: "'Press Start 2P'",
  body:    "'NeoDunggeunmo', 'Galmuri11', monospace",
  pixel:   "'Press Start 2P', monospace",
};

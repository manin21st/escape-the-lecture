import Phaser from 'phaser';
import { TILE, PAL } from '../constants';

export function generateTileTextures(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ add: false });

  // --- FLOOR ---
  g.clear();
  g.fillStyle(PAL.floor);
  g.fillRect(0, 0, TILE, TILE);
  g.lineStyle(1, PAL.floorLine, 0.25);
  g.lineBetween(0, 0, TILE, 0);
  g.lineBetween(0, 0, 0, TILE);
  g.generateTexture('tile_floor', TILE, TILE);

  // --- FLOOR ALT (checker) ---
  g.clear();
  g.fillStyle(PAL.floorAlt);
  g.fillRect(0, 0, TILE, TILE);
  g.lineStyle(1, PAL.floorLine, 0.2);
  g.lineBetween(0, 0, TILE, 0);
  g.lineBetween(0, 0, 0, TILE);
  g.generateTexture('tile_floor_alt', TILE, TILE);

  // --- WALL ---
  g.clear();
  g.fillStyle(PAL.wall);
  g.fillRect(0, 0, TILE, TILE);
  g.fillStyle(PAL.wallDark);
  g.fillRect(0, 0, TILE, 4); // top shadow strip
  g.lineStyle(2, PAL.wallShadow);
  g.strokeRect(0, 0, TILE, TILE);
  g.generateTexture('tile_wall', TILE, TILE);

  // --- DESK ---
  g.clear();
  g.fillStyle(PAL.floor);
  g.fillRect(0, 0, TILE, TILE);
  // desk surface
  g.fillStyle(PAL.desk);
  g.fillRect(2, 5, TILE - 4, TILE - 10);
  g.fillStyle(PAL.deskSurface);
  g.fillRect(3, 6, TILE - 6, 4); // highlight strip
  g.lineStyle(2, PAL.deskEdge);
  g.strokeRect(2, 5, TILE - 4, TILE - 10);
  // leg shadows
  g.fillStyle(PAL.deskEdge);
  g.fillRect(3, TILE - 6, 4, 4);
  g.fillRect(TILE - 7, TILE - 6, 4, 4);
  g.generateTexture('tile_desk', TILE, TILE);

  // --- AISLE (same as floor, subtle marker) ---
  g.clear();
  g.fillStyle(PAL.floor);
  g.fillRect(0, 0, TILE, TILE);
  g.lineStyle(1, PAL.floorLine, 0.4);
  g.strokeRect(0, 0, TILE, TILE);
  g.generateTexture('tile_aisle', TILE, TILE);

  // --- EXIT ---
  g.clear();
  g.fillStyle(PAL.floor);
  g.fillRect(0, 0, TILE, TILE);
  g.fillStyle(PAL.exitGreen, 0.35);
  g.fillRect(0, 0, TILE, TILE);
  g.lineStyle(3, PAL.exitBorder);
  g.strokeRect(2, 2, TILE - 4, TILE - 4);
  // door icon lines
  g.lineStyle(2, PAL.exitBorder, 0.7);
  g.lineBetween(TILE / 2, 4, TILE / 2, TILE - 4);
  g.generateTexture('tile_exit', TILE, TILE);

  // --- PODIUM ---
  g.clear();
  g.fillStyle(PAL.floor);
  g.fillRect(0, 0, TILE, TILE);
  g.fillStyle(PAL.podium);
  g.fillRect(1, 2, TILE - 2, TILE - 4);
  g.fillStyle(0xc0905a);
  g.fillRect(2, 3, TILE - 4, 5); // highlight
  g.lineStyle(2, PAL.podiumEdge);
  g.strokeRect(1, 2, TILE - 2, TILE - 4);
  g.generateTexture('tile_podium', TILE, TILE);

  // --- BLACKBOARD ---
  g.clear();
  g.fillStyle(PAL.blackboard);
  g.fillRect(0, 0, TILE, TILE);
  // chalk lines (decorative)
  g.lineStyle(1, 0x78a878, 0.5);
  g.lineBetween(4, 10, 20, 10);
  g.lineBetween(4, 18, 28, 18);
  g.lineBetween(4, 26, 16, 26);
  g.lineStyle(2, PAL.bbLine);
  g.strokeRect(0, 0, TILE, TILE);
  g.generateTexture('tile_blackboard', TILE, TILE);

  g.destroy();
}

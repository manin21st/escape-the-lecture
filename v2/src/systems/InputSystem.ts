import Phaser from 'phaser';
import { TILE } from '../constants';
import type { TilePoint } from '../types';

function bresenham(x0: number, y0: number, x1: number, y1: number): TilePoint[] {
  const pts: TilePoint[] = [];
  let dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
  let dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  let x = x0, y = y0;
  while (true) {
    pts.push({ x, y });
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x += sx; }
    if (e2 <= dx) { err += dx; y += sy; }
  }
  return pts;
}

export class InputSystem {
  private pendingPath: TilePoint[] = [];
  private isDragging = false;
  private lastDragTile: TilePoint = { x: 0, y: 0 };
  private getPlayerTile: () => TilePoint;

  private pendingKeyDelta: { dx: number; dy: number } | null = null;

  constructor(scene: Phaser.Scene, getPlayerTile: () => TilePoint) {
    this.getPlayerTile = getPlayerTile;

    scene.input.on('pointerdown', (_ptr: Phaser.Input.Pointer) => {
      const p = this.getPlayerTile();
      this.isDragging = true;
      this.pendingPath = [];
      this.lastDragTile = { x: p.x, y: p.y };
    });

    scene.input.on('pointermove', (ptr: Phaser.Input.Pointer) => {
      if (!this.isDragging) return;
      const tx = Math.floor(ptr.worldX / TILE);
      const ty = Math.floor(ptr.worldY / TILE);
      if (tx === this.lastDragTile.x && ty === this.lastDragTile.y) return;

      const line = bresenham(this.lastDragTile.x, this.lastDragTile.y, tx, ty);
      for (const pt of line.slice(1)) {
        const prev = this.pendingPath.length > 0
          ? this.pendingPath[this.pendingPath.length - 1]
          : this.lastDragTile;
        if (pt.x !== prev.x || pt.y !== prev.y) {
          this.pendingPath.push(pt);
        }
      }
      this.lastDragTile = { x: tx, y: ty };
    });

    scene.input.on('pointerup', () => {
      this.isDragging = false;
    });

    // Keyboard — event-driven so keydown fires reliably each press/repeat
    if (scene.input.keyboard) {
      const kb = scene.input.keyboard;
      const dir = (dx: number, dy: number) => { this.pendingKeyDelta = { dx, dy }; };
      kb.on('keydown-LEFT',  () => dir(-1,  0));
      kb.on('keydown-RIGHT', () => dir( 1,  0));
      kb.on('keydown-UP',    () => dir( 0, -1));
      kb.on('keydown-DOWN',  () => dir( 0,  1));
      kb.on('keydown-A',     () => dir(-1,  0));
      kb.on('keydown-D',     () => dir( 1,  0));
      kb.on('keydown-W',     () => dir( 0, -1));
      kb.on('keydown-S',     () => dir( 0,  1));
    }
  }

  drainPath(): TilePoint[] | null {
    if (this.pendingPath.length === 0) return null;
    const path = [...this.pendingPath];
    this.pendingPath = [];
    return path;
  }

  drainKeyStep(): { dx: number; dy: number } | null {
    const step = this.pendingKeyDelta;
    this.pendingKeyDelta = null;
    return step;
  }

  destroy(): void {}
}

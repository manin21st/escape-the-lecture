import Phaser from 'phaser';
import { TILE } from '../constants';
import type { TilePoint } from '../types';

export class Player {
  sprite: Phaser.GameObjects.Image;
  tileX: number;
  tileY: number;
  isMoving = false;
  isInGrace = false;
  graceTimer = 0;

  private path: TilePoint[] = [];
  // 5 tiles/sec at TILE=16: 5 * 16 = 80 px/s
  private speed = 80;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, start: TilePoint) {
    this.scene = scene;
    this.tileX = start.x;
    this.tileY = start.y;
    this.sprite = scene.add.image(
      start.x * TILE + TILE / 2,
      start.y * TILE + TILE / 2,
      'player',
    ).setDepth(20).setScale(1);
  }

  setPath(points: TilePoint[]): void {
    this.path = [...points];
    this.isMoving = this.path.length > 0;
  }

  appendPath(points: TilePoint[]): void {
    this.path.push(...points);
    this.isMoving = this.path.length > 0;
  }

  clearPath(): void {
    this.path = [];
    this.isMoving = false;
    this.sprite.x = Math.round(this.tileX * TILE + TILE / 2);
    this.sprite.y = Math.round(this.tileY * TILE + TILE / 2);
  }

  startGrace(duration = 0.35): void {
    this.isInGrace = true;
    this.graceTimer = duration;
  }

  update(dt: number): void {
    if (this.isInGrace) {
      this.graceTimer -= dt;
      if (this.graceTimer <= 0) this.isInGrace = false;
    }

    if (this.path.length === 0) {
      this.isMoving = false;
      return;
    }

    this.isMoving = true;
    const target = this.path[0];
    const tx = target.x * TILE + TILE / 2;
    const ty = target.y * TILE + TILE / 2;
    const dx = tx - this.sprite.x;
    const dy = ty - this.sprite.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 2) {
      this.sprite.x = tx;
      this.sprite.y = ty;
      this.tileX = target.x;
      this.tileY = target.y;
      this.path.shift();
      if (this.path.length === 0) this.isMoving = false;
    } else {
      const step = this.speed * dt;
      this.sprite.x += (dx / dist) * Math.min(step, dist);
      this.sprite.y += (dy / dist) * Math.min(step, dist);
    }
  }

  destroy(): void {
    this.sprite.destroy();
  }
}

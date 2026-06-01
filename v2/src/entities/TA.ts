import Phaser from 'phaser';
import { TILE, PAL, DEG_TO_RAD } from '../constants';
import type { TilePoint } from '../types';
import { Player } from './Player';

type VisionState = 'normal' | 'suspicious' | 'detected';

export class TA {
  sprite: Phaser.GameObjects.Image;
  visionGraphic: Phaser.GameObjects.Graphics;
  tileX: number;
  tileY: number;
  facingAngle = 0;
  visionState: VisionState = 'normal';

  private patrolPath: TilePoint[];
  private patrolIdx = 0;
  private speed: number;
  private scene: Phaser.Scene;
  private suspTimer = 0;
  private isPaused = false;
  private pauseTimer = 0;
  private suspicionBoostTimer = 0;
  private pauseIcon: Phaser.GameObjects.Text | null = null;

  get aisleX(): number { return this.patrolPath[0].x; }

  constructor(scene: Phaser.Scene, patrolPath: TilePoint[], speed: number) {
    this.scene = scene;
    this.patrolPath = patrolPath;
    this.speed = speed;

    const start = patrolPath[0];
    this.tileX = start.x;
    this.tileY = start.y;

    this.sprite = scene.add.image(
      start.x * TILE + TILE / 2,
      start.y * TILE + TILE / 2,
      'ta',
    ).setDepth(15);

    this.visionGraphic = scene.add.graphics().setDepth(12);
    this.updateFacingToNextWaypoint();
  }

  private updateFacingToNextWaypoint(): void {
    const next = this.patrolPath[(this.patrolIdx + 1) % this.patrolPath.length];
    if (!next) return;
    const dx = next.x - this.tileX;
    const dy = next.y - this.tileY;
    if (dx !== 0 || dy !== 0) {
      this.facingAngle = Math.atan2(dy, dx);
    }
  }

  pause(duration: number): void {
    this.isPaused = true;
    this.pauseTimer = duration;
    if (!this.pauseIcon) {
      this.pauseIcon = this.scene.add.text(
        this.sprite.x, this.sprite.y - 22, '⏸',
        { fontSize: '11px', color: '#999999', fontFamily: 'monospace' },
      ).setOrigin(0.5).setDepth(30);
    }
  }

  boostSuspicion(duration: number): void {
    this.suspicionBoostTimer = duration;
    if (this.visionState === 'normal') {
      this.visionState = 'suspicious';
      this.suspTimer = duration;
    }
  }

  update(dt: number): void {
    if (this.isPaused) {
      this.pauseTimer -= dt;
      if (this.pauseTimer <= 0) {
        this.isPaused = false;
        if (this.pauseIcon) { this.pauseIcon.destroy(); this.pauseIcon = null; }
      } else if (this.pauseIcon) {
        this.pauseIcon.setPosition(this.sprite.x, this.sprite.y - 22);
      }
      this.drawVisionCone();
      return;
    }

    if (this.suspicionBoostTimer > 0) {
      this.suspicionBoostTimer -= dt;
    }

    if (this.patrolPath.length < 2) return;

    const target = this.patrolPath[this.patrolIdx];
    const tx = target.x * TILE + TILE / 2;
    const ty = target.y * TILE + TILE / 2;
    const dx = tx - this.sprite.x;
    const dy = ty - this.sprite.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 3) {
      this.sprite.x = tx;
      this.sprite.y = ty;
      this.tileX = target.x;
      this.tileY = target.y;
      this.patrolIdx = (this.patrolIdx + 1) % this.patrolPath.length;
      this.updateFacingToNextWaypoint();
    } else {
      const step = this.speed * dt;
      this.facingAngle = Math.atan2(dy, dx);
      this.sprite.x += (dx / dist) * Math.min(step, dist);
      this.sprite.y += (dy / dist) * Math.min(step, dist);
      this.sprite.setFlipX(dx < 0);
    }

    if (this.visionState === 'suspicious') {
      this.suspTimer -= dt;
      if (this.suspTimer <= 0) this.visionState = 'normal';
    }

    this.drawVisionCone();
  }

  checkPlayer(player: Player): 'outside' | 'suspicious' | 'detected' {
    if (this.isPaused) return 'outside';

    const dx = player.sprite.x - this.sprite.x;
    const dy = player.sprite.y - this.sprite.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const range = (this.suspicionBoostTimer > 0 ? 6 : 4) * TILE;

    if (dist > range) {
      if (this.visionState !== 'suspicious') this.visionState = 'normal';
      return 'outside';
    }

    const angle = Math.atan2(dy, dx);
    let diff = Math.abs(angle - this.facingAngle);
    while (diff > Math.PI) diff = Math.abs(diff - 2 * Math.PI);

    if (diff > 45 * DEG_TO_RAD) {
      if (this.visionState !== 'suspicious') this.visionState = 'normal';
      return 'outside';
    }

    if (dist < range * 0.45) {
      this.visionState = 'detected';
      return 'detected';
    }

    this.visionState = 'suspicious';
    this.suspTimer = 1.5;
    return 'suspicious';
  }

  private drawVisionCone(): void {
    const g = this.visionGraphic;
    g.clear();

    let color: number;
    let alpha: number;

    if (this.isPaused) {
      color = 0x888888;
      alpha = 0.15;
    } else if (this.suspicionBoostTimer > 0) {
      const colorMap = { normal: 0xff6600, suspicious: PAL.suspOrange, detected: PAL.detected };
      const alphaMap = { normal: 0.32, suspicious: 0.42, detected: 0.55 };
      color = colorMap[this.visionState];
      alpha = alphaMap[this.visionState];
    } else {
      const colorMap = { normal: PAL.warnYellow, suspicious: PAL.suspOrange, detected: PAL.detected };
      const alphaMap = { normal: 0.22, suspicious: 0.35, detected: 0.55 };
      color = colorMap[this.visionState];
      alpha = alphaMap[this.visionState];
    }

    const range = 4 * TILE;
    const halfAngle = 45 * DEG_TO_RAD;
    const steps = 14;

    g.fillStyle(color, alpha);
    g.beginPath();
    g.moveTo(this.sprite.x, this.sprite.y);

    for (let i = 0; i <= steps; i++) {
      const a = this.facingAngle - halfAngle + (i / steps) * (halfAngle * 2);
      g.lineTo(
        this.sprite.x + Math.cos(a) * range,
        this.sprite.y + Math.sin(a) * range,
      );
    }

    g.closePath();
    g.fillPath();
  }

  redirectTo(tile: TilePoint, duration: number): void {
    // Temporarily insert waypoint at start of path
    this.patrolPath.splice(this.patrolIdx, 0, tile);
    this.scene.time.delayedCall(duration * 1000, () => {
      const idx = this.patrolPath.indexOf(tile);
      if (idx !== -1) this.patrolPath.splice(idx, 1);
    });
  }

  destroy(): void {
    this.sprite.destroy();
    this.visionGraphic.destroy();
    if (this.pauseIcon) this.pauseIcon.destroy();
  }
}

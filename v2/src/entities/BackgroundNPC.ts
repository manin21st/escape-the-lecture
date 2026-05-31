import Phaser from 'phaser';
import { TILE } from '../constants';
import type { TilePoint } from '../types';

export class BackgroundNPC {
  sprite: Phaser.GameObjects.Image;
  private tween: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, tile: TilePoint) {
    this.sprite = scene.add.image(
      tile.x * TILE + TILE / 2,
      tile.y * TILE + TILE / 2,
      'npc',
    ).setDepth(10);

    // Slight random offset so they look natural
    this.sprite.x += Phaser.Math.Between(-4, 4);
    this.sprite.y += Phaser.Math.Between(-2, 2);

    // Writing bob animation (subtle up/down)
    const delay = Phaser.Math.Between(0, 1200);
    this.tween = scene.tweens.add({
      targets: this.sprite,
      y: this.sprite.y - 2,
      duration: 800 + Phaser.Math.Between(0, 400),
      yoyo: true,
      repeat: -1,
      delay,
      ease: 'Sine.easeInOut',
    });
  }

  update(_dt: number): void {
    // tween handles everything
  }

  destroy(): void {
    this.tween.stop();
    this.sprite.destroy();
  }
}

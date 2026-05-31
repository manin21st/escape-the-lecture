import Phaser from 'phaser';
import { TILE } from '../constants';
import type { Phase } from '../types';

export class Professor {
  sprite: Phaser.GameObjects.Image;
  readonly tileX = 9;
  readonly tileY = 2;

  constructor(scene: Phaser.Scene) {
    this.sprite = scene.add.image(
      this.tileX * TILE + TILE / 2,
      this.tileY * TILE + TILE / 2,
      'professor',
    ).setDepth(15);
  }

  updateVisual(phase: Phase): void {
    if (phase === 'lecture') {
      this.sprite.clearTint();
      this.sprite.setFlipX(true); // facing board
    } else if (phase === 'watch') {
      this.sprite.clearTint();
      this.sprite.setFlipX(false); // facing students
    } else {
      this.sprite.setTint(0xff6666); // suspicion — red tint
      this.sprite.setFlipX(false);
    }
  }

  hideWarning(): void {
    // no-op — warning visuals handled by updateVisual
  }

  destroy(): void {
    this.sprite.destroy();
  }
}

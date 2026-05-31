import Phaser from 'phaser';
import { TILE, COLS, ROWS, PAL } from '../constants';
import type { TileType, TilePoint } from '../types';

export class MapSystem {
  private scene: Phaser.Scene;
  private exitTweenSprite: Phaser.GameObjects.Image | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  build(grid: TileType[][], exitTile: TilePoint): void {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const tile = grid[row][col];
        const x = col * TILE + TILE / 2;
        const y = row * TILE + TILE / 2;
        const key = this.tileKey(tile, col, row);
        this.scene.add.image(x, y, key).setDepth(0);
      }
    }

    // Animated exit marker on top
    const ex = exitTile.x * TILE + TILE / 2;
    const ey = exitTile.y * TILE + TILE / 2;
    this.exitTweenSprite = this.scene.add.image(ex, ey, 'tile_exit').setDepth(1).setAlpha(0.6);
    this.scene.tweens.add({
      targets: this.exitTweenSprite,
      alpha: { from: 0.6, to: 1.0 },
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    // Exit label arrow
    this.scene.add.text(ex, ey, '↑', {
      fontFamily: "'Press Start 2P'",
      fontSize: '10px',
      color: '#228822',
    }).setOrigin(0.5).setDepth(2);
  }

  private tileKey(tile: TileType, col: number, row: number): string {
    switch (tile) {
      case 1: return 'tile_wall';
      case 2: return 'tile_desk';
      case 3: return 'tile_aisle';
      case 4: return 'tile_exit';
      case 5: return 'tile_podium';
      case 6: return 'tile_blackboard';
      default:
        // Checker pattern for floor
        return (col + row) % 2 === 0 ? 'tile_floor' : 'tile_floor_alt';
    }
  }

  destroy(): void {
    this.exitTweenSprite?.destroy();
  }
}

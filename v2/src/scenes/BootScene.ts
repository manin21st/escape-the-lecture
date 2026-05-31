import Phaser from 'phaser';
import type { GameState } from '../types';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  create(): void {
    // Pixel-perfect canvas CSS
    const canvas = this.sys.game.canvas;
    canvas.style.imageRendering = 'pixelated';
    (canvas.style as CSSStyleDeclaration & { imageRendering: string }).imageRendering = 'crisp-edges';

    // pixelArt:true in game config handles NEAREST filter automatically

    // Initialize global game state
    const state: GameState = {
      period: 1,
      totalRetries: 0,
      clearedPeriods: [],
      startTime: Date.now(),
    };
    this.registry.set('gameState', state);

    // Integer zoom handled by Scale.FIT mode in game config

    this.scene.start('PreloadScene');
  }
}

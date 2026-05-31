import Phaser from 'phaser';
import { GAME_W, GAME_H, PAL, FONTS } from '../constants';
import { generateTileTextures } from '../textures/generateTiles';
import { generateCharTextures } from '../textures/generateChars';

export class PreloadScene extends Phaser.Scene {
  constructor() { super('PreloadScene'); }

  preload(): void {
    // Loading bar
    const barBg = this.add.graphics();
    barBg.fillStyle(PAL.uiBorder, 1);
    barBg.fillRect(GAME_W / 2 - 152, GAME_H / 2 - 14, 304, 28);

    const bar = this.add.graphics();
    this.load.on('progress', (v: number) => {
      bar.clear();
      bar.fillStyle(PAL.moveGreen, 1);
      bar.fillRect(GAME_W / 2 - 150, GAME_H / 2 - 12, 300 * v, 24);
    });

    this.add.text(GAME_W / 2, GAME_H / 2 - 40, 'LOADING...', {
      fontFamily: FONTS.pixel,
      fontSize: '14px',
      color: '#f8f0d8',
    }).setOrigin(0.5);
  }

  create(): void {
    // Generate all textures at runtime
    generateTileTextures(this);
    generateCharTextures(this);
    this.scene.start('TitleScene');
  }
}

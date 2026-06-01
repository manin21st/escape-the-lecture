import Phaser from 'phaser';
import { GAME_W, GAME_H } from './constants';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { TitleScene } from './scenes/TitleScene';
import { GameScene } from './scenes/GameScene';
import { PeriodTransitionScene } from './scenes/PeriodTransitionScene';
import { ResultScene } from './scenes/ResultScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_W,
  height: GAME_H,
  backgroundColor: '#d8b88a',
  pixelArt: true,
  antialias: false,
  render: {
    antialias: false,
    antialiasGL: false,
    pixelArt: true,
    roundPixels: true,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_W,
    height: GAME_H,
  },
  scene: [
    BootScene,
    PreloadScene,
    TitleScene,
    GameScene,
    PeriodTransitionScene,
    ResultScene,
  ],
  parent: 'game-container',
};

(window as any).__phaserGame = new Phaser.Game(config);

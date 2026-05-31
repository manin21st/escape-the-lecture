import Phaser from 'phaser';
import { GAME_W, GAME_H, PAL, FONTS } from '../constants';
import { RetroButton } from '../ui/RetroButton';

export class TitleScene extends Phaser.Scene {
  constructor() { super('TitleScene'); }

  create(): void {
    const bg = this.add.graphics();
    bg.fillStyle(PAL.floor, 1);
    bg.fillRect(0, 0, GAME_W, GAME_H);

    // Pixel grid pattern
    bg.lineStyle(1, PAL.floorLine, 0.15);
    for (let x = 0; x < GAME_W; x += 32) bg.lineBetween(x, 0, x, GAME_H);
    for (let y = 0; y < GAME_H; y += 32) bg.lineBetween(0, y, GAME_W, y);

    // Title box
    const boxW = 480, boxH = 320;
    const bx = (GAME_W - boxW) / 2;
    const by = (GAME_H - boxH) / 2 - 20;
    const box = this.add.graphics();
    box.fillStyle(PAL.uiInner, 1);
    box.fillRect(bx, by, boxW, boxH);
    box.lineStyle(4, PAL.uiBorder);
    box.strokeRect(bx, by, boxW, boxH);
    // Pixel shadow
    box.lineStyle(3, PAL.wallDark);
    box.lineBetween(bx + 4, by + boxH, bx + boxW, by + boxH);
    box.lineBetween(bx + boxW, by + 4, bx + boxW, by + boxH);

    // Main title
    this.add.text(GAME_W / 2, by + 54, '강의실 탈출', {
      fontFamily: FONTS.body,
      fontSize: '32px',
      color: '#4a2c1a',
    }).setOrigin(0.5);

    this.add.text(GAME_W / 2, by + 90, 'ESCAPE THE LECTURE', {
      fontFamily: FONTS.pixel,
      fontSize: '12px',
      color: '#6b4423',
    }).setOrigin(0.5);

    this.add.text(GAME_W / 2, by + 110, 'v2', {
      fontFamily: FONTS.pixel,
      fontSize: '10px',
      color: '#8888aa',
    }).setOrigin(0.5);

    // How to play
    this.add.text(GAME_W / 2, by + 152, [
      '교수님이 판서할 때 이동하세요',
      '돌아보면 즉시 멈춰야 합니다!',
      '',
      '강의실을 5번 탈출하면 성공!',
    ].join('\n'), {
      fontFamily: FONTS.body,
      fontSize: '14px',
      color: '#4a2c1a',
      align: 'center',
      lineSpacing: 6,
    }).setOrigin(0.5, 0);

    // Start button
    const startBtn = new RetroButton(this, GAME_W / 2, by + boxH - 44, '강의실 입장 →', 200, 38);
    startBtn.on('pointerup', () => {
      const state = this.registry.get('gameState');
      state.startTime = Date.now();
      this.registry.set('gameState', state);
      this.scene.start('GameScene', { period: 1 });
    });

    // Credits note
    this.add.text(GAME_W / 2, GAME_H - 16, 'Assets: runtime generated (CC0)', {
      fontFamily: FONTS.body,
      fontSize: '10px',
      color: '#8b5a2b',
    }).setOrigin(0.5);

    // Blink cursor effect
    const cursor = this.add.text(GAME_W / 2 + 108, by + boxH - 44, '▌', {
      fontFamily: FONTS.pixel,
      fontSize: '14px',
      color: '#f8f0d8',
    }).setOrigin(0.5);
    this.tweens.add({
      targets: cursor,
      alpha: 0,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
  }
}

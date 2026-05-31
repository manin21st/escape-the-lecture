import Phaser from 'phaser';
import { GAME_W, GAME_H, PAL, FONTS } from '../constants';
import { RetroButton } from '../ui/RetroButton';
import type { GameState } from '../types';

export class ResultScene extends Phaser.Scene {
  constructor() { super('ResultScene'); }

  init(data: { success: boolean; period: number }): void {
    const { success } = data;
    const state = this.registry.get('gameState') as GameState;
    const elapsedMs = Date.now() - state.startTime;
    const elapsedSec = Math.floor(elapsedMs / 1000);
    const minutes = Math.floor(elapsedSec / 60).toString().padStart(2, '0');
    const seconds = (elapsedSec % 60).toString().padStart(2, '0');

    // Background
    const bgColor = success ? 0x2a4a2a : 0x4a2a2a;
    this.cameras.main.setBackgroundColor(Phaser.Display.Color.IntegerToColor(bgColor).rgba);

    // Result panel
    const boxW = 480, boxH = 340;
    const bx = (GAME_W - boxW) / 2;
    const by = (GAME_H - boxH) / 2 - 10;

    const box = this.add.graphics();
    box.fillStyle(PAL.uiInner, 1);
    box.fillRect(bx, by, boxW, boxH);
    box.lineStyle(4, success ? PAL.moveGreen : PAL.stopRed);
    box.strokeRect(bx, by, boxW, boxH);

    // Title
    const titleText = success ? '🎉 강의실 탈출 성공!' : '😵 잡혔다!';
    const titleColor = success ? '#44cc44' : '#cc4444';
    this.add.text(GAME_W / 2, by + 50, titleText, {
      fontFamily: FONTS.body,
      fontSize: '26px',
      color: titleColor,
    }).setOrigin(0.5);

    // Stats
    const cleared = state.clearedPeriods.length;
    const statsLines = [
      `탈출 교시: ${cleared} / 5`,
      `재시도: ${state.totalRetries}회`,
      `경과 시간: ${minutes}:${seconds}`,
    ];
    this.add.text(GAME_W / 2, by + 110, statsLines.join('\n'), {
      fontFamily: FONTS.body,
      fontSize: '16px',
      color: '#4a2c1a',
      align: 'center',
      lineSpacing: 10,
    }).setOrigin(0.5, 0);

    // Final message
    const finalMsg = success
      ? '수고했어요! 강의실 5교시 모두 탈출했습니다!'
      : `${cleared}교시까지 탈출했습니다. 다시 도전해보세요!`;
    this.add.text(GAME_W / 2, by + 215, finalMsg, {
      fontFamily: FONTS.body,
      fontSize: '13px',
      color: '#6b4423',
      align: 'center',
      wordWrap: { width: 400 },
    }).setOrigin(0.5);

    // Credits
    if (success) {
      this.add.text(GAME_W / 2, by + 252, 'Assets: runtime generated (CC0)', {
        fontFamily: FONTS.body,
        fontSize: '10px',
        color: '#8888aa',
      }).setOrigin(0.5);
    }

    // Retry button
    const retryBtn = new RetroButton(
      this,
      GAME_W / 2 - 90,
      by + boxH - 36,
      '↩ 다시 도전',
      158,
      34,
      PAL.stopRed,
    );
    retryBtn.on('pointerup', () => {
      const fresh: GameState = {
        period: 1,
        totalRetries: 0,
        clearedPeriods: [],
        startTime: Date.now(),
      };
      this.registry.set('gameState', fresh);
      this.scene.start('GameScene', { period: 1 });
    });

    // Title button
    const titleBtn = new RetroButton(
      this,
      GAME_W / 2 + 90,
      by + boxH - 36,
      '🏠 타이틀로',
      158,
      34,
      PAL.uiFrame,
    );
    titleBtn.on('pointerup', () => {
      const fresh: GameState = {
        period: 1,
        totalRetries: 0,
        clearedPeriods: [],
        startTime: Date.now(),
      };
      this.registry.set('gameState', fresh);
      this.scene.start('TitleScene');
    });
  }

  create(): void {} // init does everything
}

import Phaser from 'phaser';
import { GAME_W, GAME_H, PAL, FONTS } from '../constants';
import { PERIOD_CONFIGS } from '../data/periods';

export class PeriodTransitionScene extends Phaser.Scene {
  constructor() { super('PeriodTransitionScene'); }

  init(data: { period: number }): void {
    const clearedPeriod = data.period;
    const nextPeriod = clearedPeriod + 1;

    this.cameras.main.setBackgroundColor('#2c1a0e');

    const nextConfig = PERIOD_CONFIGS[nextPeriod - 1];

    // Clear banner
    this.add.text(GAME_W / 2, 90, `${clearedPeriod}교시 탈출 성공!`, {
      fontFamily: FONTS.body,
      fontSize: '28px',
      color: '#88ff88',
    }).setOrigin(0.5);

    // Pixel divider
    const div = this.add.graphics();
    div.lineStyle(2, PAL.uiFrame);
    div.lineBetween(80, 130, GAME_W - 80, 130);

    // Next period preview
    this.add.text(GAME_W / 2, 165, '다음', {
      fontFamily: FONTS.pixel,
      fontSize: '10px',
      color: '#8b6a4a',
    }).setOrigin(0.5);

    this.add.text(GAME_W / 2, 200, `${nextConfig.label} — ${nextConfig.subject}`, {
      fontFamily: FONTS.body,
      fontSize: '22px',
      color: '#f8f0d8',
    }).setOrigin(0.5);

    // TA count info
    if (nextConfig.taCount > 0) {
      this.add.text(GAME_W / 2, 240, `⚠️ 조교 ${nextConfig.taCount}명이 순찰합니다`, {
        fontFamily: FONTS.body,
        fontSize: '15px',
        color: '#ffcc44',
      }).setOrigin(0.5);
    } else {
      this.add.text(GAME_W / 2, 240, '✓ 조교 없음 — 좋은 기회!', {
        fontFamily: FONTS.body,
        fontSize: '15px',
        color: '#88cc88',
      }).setOrigin(0.5);
    }

    // Difficulty indicator
    const stars = '★'.repeat(nextPeriod) + '☆'.repeat(5 - nextPeriod);
    this.add.text(GAME_W / 2, 278, `난이도 ${stars}`, {
      fontFamily: FONTS.body,
      fontSize: '16px',
      color: '#ffdd44',
    }).setOrigin(0.5);

    // Countdown
    const countdownText = this.add.text(GAME_W / 2, GAME_H - 60, '3', {
      fontFamily: FONTS.pixel,
      fontSize: '22px',
      color: '#f8f0d8',
    }).setOrigin(0.5);

    let count = 3;
    const timer = this.time.addEvent({
      delay: 1000,
      repeat: 2,
      callback: () => {
        count--;
        if (count <= 0) {
          this.scene.start('GameScene', { period: nextPeriod });
        } else {
          countdownText.setText(String(count));
        }
      },
    });

    // Skip button
    this.add.text(GAME_W / 2, GAME_H - 22, '[ 클릭하면 바로 시작 ]', {
      fontFamily: FONTS.body,
      fontSize: '12px',
      color: '#8b6a4a',
    }).setOrigin(0.5).setInteractive({ cursor: 'pointer' })
      .on('pointerup', () => {
        timer.remove();
        this.scene.start('GameScene', { period: nextPeriod });
      });
  }

  create(): void {} // init does everything
}

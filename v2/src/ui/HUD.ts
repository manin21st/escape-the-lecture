import Phaser from 'phaser';
import { GAME_W, GAME_H, PAL, FONTS } from '../constants';
import type { Phase } from '../types';

const HUD_H = 24;

export class HUD {
  private scene: Phaser.Scene;
  private topBg: Phaser.GameObjects.Graphics;
  private botBg: Phaser.GameObjects.Graphics;
  private periodLabel: Phaser.GameObjects.Text;
  private phaseLabel: Phaser.GameObjects.Text;
  private exitLabel: Phaser.GameObjects.Text;
  private friendLabel: Phaser.GameObjects.Text;
  private totalFriends: number;
  private usedFriends = 0;

  constructor(scene: Phaser.Scene, period: number, friendCount: number, exitLabelText: string) {
    this.scene = scene;
    this.totalFriends = friendCount;

    this.topBg = scene.add.graphics().setDepth(90).setScrollFactor(0);
    this.topBg.fillStyle(PAL.uiFrame, 1);
    this.topBg.fillRect(0, 0, GAME_W, HUD_H);
    this.topBg.lineStyle(2, PAL.uiBorder);
    this.topBg.strokeRect(0, 0, GAME_W, HUD_H);

    this.botBg = scene.add.graphics().setDepth(90).setScrollFactor(0);
    this.botBg.fillStyle(PAL.uiFrame, 1);
    this.botBg.fillRect(0, GAME_H - HUD_H, GAME_W, HUD_H);
    this.botBg.lineStyle(2, PAL.uiBorder);
    this.botBg.strokeRect(0, GAME_H - HUD_H, GAME_W, HUD_H);

    const textOpts: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: FONTS.body,
      fontSize: '11px',
      color: '#f8f0d8',
    };

    this.periodLabel = scene.add.text(6, HUD_H / 2, `${period}교시`, textOpts)
      .setOrigin(0, 0.5).setDepth(91).setScrollFactor(0);

    this.phaseLabel = scene.add.text(GAME_W / 2, HUD_H / 2, '📖 이동', {
      ...textOpts,
      fontSize: '12px',
      color: '#b8ffb8',
    }).setOrigin(0.5).setDepth(91).setScrollFactor(0);

    this.exitLabel = scene.add.text(GAME_W - 6, HUD_H / 2, exitLabelText, textOpts)
      .setOrigin(1, 0.5).setDepth(91).setScrollFactor(0);

    this.friendLabel = scene.add.text(GAME_W / 2, GAME_H - HUD_H / 2, '', textOpts)
      .setOrigin(0.5).setDepth(91).setScrollFactor(0);
    this.updateFriendLabel();
  }

  update(phase: Phase): void {
    if (phase === 'lecture') {
      this.phaseLabel.setText('📖 이동').setColor('#88ff88').setAlpha(1);
    } else if (phase === 'watch') {
      this.phaseLabel.setText('🛑 정지!').setColor('#ff8888').setAlpha(1);
    } else {
      this.phaseLabel.setText('⚠️ 의심!').setColor('#ff4444').setAlpha(1);
    }
  }

  decreaseFriendUse(): void {
    this.usedFriends++;
    this.updateFriendLabel();
  }

  private updateFriendLabel(): void {
    const remaining = this.totalFriends - this.usedFriends;
    const hearts = '❤️'.repeat(Math.max(0, remaining)) + '🖤'.repeat(Math.max(0, this.usedFriends));
    this.friendLabel.setText(`친구: ${hearts}`);
  }

  destroy(): void {
    this.topBg.destroy();
    this.botBg.destroy();
    this.periodLabel.destroy();
    this.phaseLabel.destroy();
    this.exitLabel.destroy();
    this.friendLabel.destroy();
  }
}

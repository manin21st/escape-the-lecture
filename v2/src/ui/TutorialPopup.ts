import Phaser from 'phaser';
import { GAME_W, GAME_H, PAL, FONTS } from '../constants';
import { RetroButton } from './RetroButton';
import { DIALOGS } from '../data/dialogs';

export class TutorialPopup {
  private container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, onClose: () => void) {
    const bg = scene.add.graphics();
    bg.fillStyle(0x000000, 0.6);
    bg.fillRect(-GAME_W / 2, -GAME_H / 2, GAME_W, GAME_H);

    const box = scene.add.graphics();
    box.fillStyle(PAL.uiInner, 1);
    box.fillRect(-110, -100, 220, 210);
    box.lineStyle(3, PAL.uiBorder);
    box.strokeRect(-110, -100, 220, 210);

    const title = scene.add.text(0, -82, '📖 강의실 탈출 방법', {
      fontFamily: FONTS.pixel,
      fontSize: '9px',
      color: '#4a2c1a',
    }).setOrigin(0.5);

    const lines = [
      DIALOGS.tutorial.line1,
      DIALOGS.tutorial.line2,
      DIALOGS.tutorial.line3,
    ];
    const texts: Phaser.GameObjects.Text[] = [];
    lines.forEach((line, i) => {
      texts.push(scene.add.text(0, -48 + i * 56, line, {
        fontFamily: FONTS.body,
        fontSize: '12px',
        color: '#2c1a0a',
        align: 'center',
      }).setOrigin(0.5));
    });

    const btn = new RetroButton(scene, 0, 88, '알겠어요!', 120, 28);
    btn.on('pointerup', () => {
      this.container.destroy();
      onClose();
    });

    this.container = scene.add.container(GAME_W / 2, GAME_H / 2, [
      bg, box, title, ...texts, btn,
    ]).setDepth(200).setScrollFactor(0);
  }

  destroy(): void {
    this.container.destroy();
  }
}

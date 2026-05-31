import Phaser from 'phaser';
import { TILE, GAME_W, GAME_H, PAL, FONTS } from '../constants';
import type { TileType, Phase, GameState } from '../types';
import { PERIOD_CONFIGS } from '../data/periods';
import { DIALOGS } from '../data/dialogs';
import { buildGrid, isWalkable, SEAT_POSITIONS, PLAYER_START, FRIEND_SEATS, TA_PATROL_PATHS } from '../data/maps';
import { MapSystem } from '../systems/MapSystem';
import { PhaseManager } from '../systems/PhaseManager';
import { InputSystem } from '../systems/InputSystem';
import { DialogSystem } from '../systems/DialogSystem';
import { Player } from '../entities/Player';
import { Professor } from '../entities/Professor';
import { TA } from '../entities/TA';
import { Friend } from '../entities/Friend';
import { BackgroundNPC } from '../entities/BackgroundNPC';
import { HUD } from '../ui/HUD';
import { TutorialPopup } from '../ui/TutorialPopup';

export class GameScene extends Phaser.Scene {
  private grid!: TileType[][];
  private player!: Player;
  private professor!: Professor;
  private tas: TA[] = [];
  private friends: Friend[] = [];
  private bgNpcs: BackgroundNPC[] = [];
  private phaseManager!: PhaseManager;
  private mapSystem!: MapSystem;
  private inputSystem!: InputSystem;
  private dialogSystem!: DialogSystem;
  private hud!: HUD;
  private period = 1;
  private isGameOver = false;
  private isPaused = false;
  private profDialogTimer = 0;
  private firstWatchDone = false;

  constructor() { super('GameScene'); }

  init(data: { period?: number }): void {
    this.period = data.period ?? 1;
    this.isGameOver = false;
    this.isPaused = false;
    this.tas = [];
    this.friends = [];
    this.bgNpcs = [];
    this.firstWatchDone = false;
  }

  create(): void {
    const config = PERIOD_CONFIGS[this.period - 1];

    // Build map
    this.grid = buildGrid(config.exitTile);
    this.mapSystem = new MapSystem(this);
    this.mapSystem.build(this.grid, config.exitTile);

    // Entities
    this.player = new Player(this, PLAYER_START);
    this.professor = new Professor(this);

    // Background NPCs (fill most seats, skip friend seats and player seat)
    const friendSeats = FRIEND_SEATS[this.period] ?? [];
    const usedSeats = new Set(friendSeats.map(t => `${t.x},${t.y}`));
    usedSeats.add(`${PLAYER_START.x},${PLAYER_START.y}`);

    let npcCount = 0;
    for (const seat of SEAT_POSITIONS) {
      if (npcCount >= 22) break;
      if (usedSeats.has(`${seat.x},${seat.y}`)) continue;
      this.bgNpcs.push(new BackgroundNPC(this, seat));
      npcCount++;
    }

    // TAs
    const taPatrols = TA_PATROL_PATHS[this.period] ?? [];
    for (let i = 0; i < config.taCount && i < taPatrols.length; i++) {
      this.tas.push(new TA(this, taPatrols[i], config.taSpeed));
    }

    // Phase manager (before friends need it)
    this.phaseManager = new PhaseManager(config, (phase: Phase) => this.onPhaseChange(phase));

    // Dialog system
    this.dialogSystem = new DialogSystem(this);

    // Friends
    const friendTypes = config.friendTypes;
    friendSeats.forEach((seat, idx) => {
      if (idx >= friendTypes.length) return;
      const f = new Friend(this, seat, friendTypes[idx], config.friendUseCount);
      f.setOnClick(
        this.dialogSystem,
        this.phaseManager,
        this.tas,
        this.professor.sprite,
        () => this.onSnitchEvent(),
        () => this.hud.decreaseFriendUse(),
      );
      this.friends.push(f);
    });

    // HUD
    this.hud = new HUD(this, this.period, config.friendUseCount, config.exitLabel);

    // Input — mouse drag (Bresenham) + keyboard arrow/WASD
    this.inputSystem = new InputSystem(this, () => ({ x: this.player.tileX, y: this.player.tileY }));

    // Period label flash (fixed to screen)
    this.showPeriodBanner(config.label, config.subject);

    // Tutorial for period 1
    if (this.period === 1) {
      this.isPaused = true;
      this.time.delayedCall(600, () => {
        new TutorialPopup(this, () => { this.isPaused = false; });
      });
    }

    this.profDialogTimer = 3 + Math.random() * 2;
  }

  private onPhaseChange(phase: Phase): void {
    if (phase === 'watch' || phase === 'suspicion') {
      // Grace period — player has 0.35s to stop
      this.player.startGrace(0.35);
      this.professor.updateVisual(phase);

      const lines = phase === 'suspicion' ? DIALOGS.prof.suspicion : DIALOGS.prof.watch;
      const line = lines[Math.floor(Math.random() * lines.length)];
      this.dialogSystem.show(
        this.professor.sprite.x,
        this.professor.sprite.y - 30,
        line,
        {} as any,
        2000,
      );

      if (!this.firstWatchDone && this.period === 1) {
        this.firstWatchDone = true;
      }

    } else {
      // lecture
      this.professor.hideWarning();
      this.professor.updateVisual('lecture');
      const lines = DIALOGS.prof.lecture;
      const line = lines[Math.floor(Math.random() * lines.length)];
      this.time.delayedCall(400, () =>
        this.dialogSystem.show(
          this.professor.sprite.x,
          this.professor.sprite.y - 30,
          line,
          {},
          1800,
        ),
      );
    }
  }

  private onSnitchEvent(): void {
    this.phaseManager.triggerSnitchEvent();
    if (this.period >= 4) {
      this.cameras.main.flash(400, 200, 40, 40, false);
    }
  }

  update(_time: number, delta: number): void {
    if (this.isGameOver || this.isPaused) return;

    const dt = delta / 1000;

    this.phaseManager.update(dt);
    this.player.update(dt);

    const phase = this.phaseManager.phase;
    const canMove = phase === 'lecture';

    if (canMove && !this.player.isMoving) {
      // Drag path
      const rawPath = this.inputSystem.drainPath();
      if (rawPath) {
        const walkable: { x: number; y: number }[] = [];
        for (const pt of rawPath) {
          if (!isWalkable(this.grid, pt.x, pt.y)) break;
          walkable.push(pt);
        }
        if (walkable.length > 0) this.player.setPath(walkable);
      }

      // Keyboard: arrow keys / WASD — one tile per step
      if (!this.player.isMoving) {
        const step = this.inputSystem.drainKeyStep();
        if (step) {
          const nx = this.player.tileX + step.dx;
          const ny = this.player.tileY + step.dy;
          if (isWalkable(this.grid, nx, ny)) {
            this.player.setPath([{ x: nx, y: ny }]);
          }
        }
      }
    }

    // Professor game over: WATCH phase + player still moving after grace
    if ((phase === 'watch' || phase === 'suspicion') && this.player.isMoving && !this.player.isInGrace) {
      this.triggerGameOver('professor');
      return;
    }

    // TA detection
    for (const ta of this.tas) {
      ta.update(dt);
      const result = ta.checkPlayer(this.player);
      if (result === 'detected') {
        this.triggerGameOver('ta');
        return;
      }
    }

    // NPC animation
    for (const npc of this.bgNpcs) npc.update(dt);

    // HUD update (handles warning blink)
    this.hud.update(phase);

    // Check exit
    if (
      this.player.tileX === PERIOD_CONFIGS[this.period - 1].exitTile.x &&
      this.player.tileY === PERIOD_CONFIGS[this.period - 1].exitTile.y
    ) {
      this.triggerPeriodClear();
    }
  }

  private triggerGameOver(cause: 'professor' | 'ta'): void {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.player.clearPath();

    this.cameras.main.flash(600, 200, 0, 0);

    const msg = cause === 'professor' ? '교수님께 잡혔다!' : 'TA에게 발각됐다!';
    this.showCenterMessage(msg, PAL.stopRed);

    const profLines = DIALOGS.prof.caught;
    this.dialogSystem.show(
      this.professor.sprite.x,
      this.professor.sprite.y - 30,
      profLines[Math.floor(Math.random() * profLines.length)],
    );

    this.time.delayedCall(1800, () => {
      const state = this.registry.get('gameState') as GameState;
      state.totalRetries++;
      this.registry.set('gameState', state);
      this.scene.start('ResultScene', { success: false, period: this.period });
    });
  }

  private triggerPeriodClear(): void {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.player.clearPath();

    this.cameras.main.flash(400, 40, 180, 40);
    this.showCenterMessage('탈출 성공! 🎉', PAL.moveGreen);

    const state = this.registry.get('gameState') as GameState;
    state.clearedPeriods.push(this.period);
    this.registry.set('gameState', state);

    this.time.delayedCall(1500, () => {
      if (this.period >= 5) {
        this.scene.start('ResultScene', { success: true, period: this.period });
      } else {
        this.scene.start('PeriodTransitionScene', { period: this.period });
      }
    });
  }

  private showCenterMessage(text: string, color: number): void {
    const bg = this.add.graphics().setDepth(150).setScrollFactor(0);
    bg.fillStyle(color, 0.8);
    bg.fillRect(GAME_W / 2 - 120, GAME_H / 2 - 22, 240, 44);
    bg.lineStyle(3, PAL.uiBorder);
    bg.strokeRect(GAME_W / 2 - 120, GAME_H / 2 - 22, 240, 44);

    this.add.text(GAME_W / 2, GAME_H / 2, text, {
      fontFamily: FONTS.body,
      fontSize: '18px',
      color: '#fff8e0',
    }).setOrigin(0.5).setDepth(151).setScrollFactor(0);
  }

  private showPeriodBanner(label: string, subject: string): void {
    const banner = this.add.graphics().setDepth(140).setAlpha(0).setScrollFactor(0);
    banner.fillStyle(PAL.uiFrame, 0.9);
    banner.fillRect(GAME_W / 2 - 110, GAME_H / 2 - 30, 220, 60);
    banner.lineStyle(3, PAL.uiBorder);
    banner.strokeRect(GAME_W / 2 - 110, GAME_H / 2 - 30, 220, 60);

    const t1 = this.add.text(GAME_W / 2, GAME_H / 2 - 10, label, {
      fontFamily: FONTS.body,
      fontSize: '18px',
      color: '#f8f0d8',
    }).setOrigin(0.5).setDepth(141).setAlpha(0).setScrollFactor(0);

    const t2 = this.add.text(GAME_W / 2, GAME_H / 2 + 14, subject, {
      fontFamily: FONTS.body,
      fontSize: '13px',
      color: '#c8a870',
    }).setOrigin(0.5).setDepth(141).setAlpha(0).setScrollFactor(0);

    this.tweens.add({ targets: [banner, t1, t2], alpha: 1, duration: 300 });
    this.time.delayedCall(1500, () =>
      this.tweens.add({
        targets: [banner, t1, t2], alpha: 0, duration: 400,
        onComplete: () => { banner.destroy(); t1.destroy(); t2.destroy(); },
      }),
    );
  }
}

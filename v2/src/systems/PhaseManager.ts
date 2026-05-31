import type { Phase, PeriodConfig } from '../types';

type PhaseCallback = (phase: Phase) => void;

export class PhaseManager {
  phase: Phase = 'lecture';

  private config: PeriodConfig;
  private timer = 0;
  private forcedLectureTime = 0;
  private watchMultiplier = 1.0;
  private onPhaseChange: PhaseCallback;

  constructor(config: PeriodConfig, onPhaseChange: PhaseCallback) {
    this.config = config;
    this.onPhaseChange = onPhaseChange;
    this.timer = config.lectureTime;
  }

  update(dt: number): void {
    if (this.forcedLectureTime > 0) {
      this.forcedLectureTime -= dt;
      if (this.phase !== 'lecture') {
        this.phase = 'lecture';
        this.onPhaseChange('lecture');
      }
      return;
    }

    this.timer -= dt;

    if (this.timer <= 0) {
      if (this.phase === 'lecture') {
        this.enterWatch();
      } else {
        // watch or suspicion → back to lecture
        this.enterLecture();
      }
    }
  }

  private enterLecture(): void {
    this.phase = 'lecture';
    this.timer = this.config.lectureTime;
    this.watchMultiplier = 1.0;
    this.onPhaseChange('lecture');
  }

  private enterWatch(): void {
    this.phase = 'watch';
    this.timer = this.config.watchTime * this.watchMultiplier;
    this.onPhaseChange('watch');
  }

  forceLecture(seconds: number): void {
    this.forcedLectureTime = Math.max(this.forcedLectureTime, seconds);
    if (this.phase !== 'lecture') {
      this.phase = 'lecture';
      this.onPhaseChange('lecture');
    }
  }

  extendWatch(multiplier: number): void {
    this.watchMultiplier = Math.max(this.watchMultiplier, multiplier);
    if (this.phase === 'watch') {
      this.timer = Math.max(this.timer, this.config.watchTime * multiplier);
    }
  }

  triggerSnitchEvent(): void {
    if (this.config.suspChance > 0 || Math.random() < 0.5) {
      this.phase = 'suspicion';
      this.onPhaseChange('suspicion');
      this.extendWatch(1.5);
    }
  }

  get lectureProgress(): number {
    if (this.phase !== 'lecture') return 0;
    return Math.max(0, this.timer / this.config.lectureTime);
  }

  get watchProgress(): number {
    if (this.phase === 'lecture') return 0;
    return Math.max(0, this.timer / (this.config.watchTime * this.watchMultiplier));
  }
}

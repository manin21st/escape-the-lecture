export interface TilePoint {
  x: number;
  y: number;
}

// 0=FLOOR, 1=WALL, 2=DESK, 3=AISLE, 4=EXIT, 5=PODIUM, 6=BLACKBOARD
export type TileType = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type Phase = 'lecture' | 'watch' | 'suspicion';
export type FriendType = 'good' | 'sleeping' | 'snitch';
export type Language = 'ko' | 'en';

export interface PeriodConfig {
  period:         number;
  label:          string;
  subject:        string;
  lectureTime:    number;
  warningTime:    number;
  watchTime:      number;
  suspChance:     number;
  taCount:        number;
  friendTypes:    FriendType[];
  friendUseCount: number;
  exitTile:       TilePoint;
  exitLabel:      string;
  taSpeed:        number;
  lectureLines:   string[];
}

export interface GameState {
  period:          number;
  totalRetries:    number;
  clearedPeriods:  number[];
  startTime:       number;
}

export interface BubbleStyle {
  borderColor?: number;
  bgColor?:     number;
  fontSize?:    string;
  font?:        string;
  tailDir?:     'down' | 'up';
}

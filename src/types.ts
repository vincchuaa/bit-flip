export { Constants };
export type {
  Bit, Row, PowerUpKind, Target, ActivePowerUp, State, Action, Key, Event,
};

const Constants = {
  CanvasWidth: 400,
  CanvasHeight: 600,
  CheckLineY: 520,
  FrameRate: 20,            // ms between Tick actions
  InitialFallSpeed: 0.03,   // px per ms
  PowerUpDurationMs: 5000,
} as const;

type Bit = 0 | 1;

type Row = ReadonlyArray<Bit>;

type PowerUpKind = 'bonus' | 'speedUp' | 'slowDown' | 'clearBoard';

// falling target
type Target = Readonly<{
  id: string,
  value: number,
  y: number,
  spawnTime: number,
  powerUp: PowerUpKind | null,
}>;

// power-up in effect
type ActivePowerUp = Readonly<{
  kind: PowerUpKind,
  activatedAt: number,
  expiresAt: number,
}>;

// game state
type State = Readonly<{
  time: number,
  row: Row,
  targets: ReadonlyArray<Target>,
  exit: ReadonlyArray<Target>,
  objCount: number,
  score: number,
  gameOver: boolean,
  paused: boolean,
  powerUps: ReadonlyArray<ActivePowerUp>,
}>;

interface Action {
  apply(s: State): State;
}

// Keys used for game control.
type Key =
  | 'Digit1' | 'Digit2' | 'Digit3' | 'Digit4'
  | 'Digit5' | 'Digit6' | 'Digit7' | 'Digit8'
  | 'KeyR' | 'KeyP';

type Event = 'keydown' | 'keyup';

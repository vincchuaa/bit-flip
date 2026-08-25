export {
  rowValue, toggleBit, initialRow, initialState, Tick, FlipBit, SpawnTarget,
  Restart, TogglePause, ToggleBase, reduceState, fallSpeedAt, decayPowerUps,
  speedMultiplier, bonusScore,
};

import {
  Action, ActivePowerUp, Bit, Constants, PowerUpKind, Row, State, Target,
} from './types';

const initialRow: Row = [0, 0, 0, 0, 0, 0, 0, 0];

const rowValue = (row: Row): number =>
  row.reduce<number>((acc, bit) => (acc << 1) | bit, 0);

const toggleBit = (index: number) => (row: Row): Row =>
  row.map((bit, i) => (i === index ? ((bit === 0 ? 1 : 0) as Bit) : bit));

const initialState: State = {
  time: 0,
  row: initialRow,
  targets: [],
  exit: [],
  objCount: 0,
  score: 0,
  gameOver: false,
  paused: false,
  powerUps: [],
  base: 16,
};

const moveTarget = (dy: number) => (t: Target): Target => ({
  ...t, y: t.y + dy,
});

// speed rises the longer the player survives
const fallSpeedAt = (elapsedMs: number): number =>
  Constants.InitialFallSpeed + Math.floor(elapsedMs / 15000) * 0.01;

// closest target to the check line, since that's the only one being played
const lowestTarget = (ts: ReadonlyArray<Target>): Target | undefined =>
  ts.reduce<Target | undefined>(
    (lo, t) => (!lo || t.y > lo.y ? t : lo), undefined);

const activatePowerUp = (kind: PowerUpKind, now: number): ActivePowerUp => ({
  kind, activatedAt: now, expiresAt: now + Constants.PowerUpDurationMs,
});

const decayPowerUps = (
  ps: ReadonlyArray<ActivePowerUp>, now: number,
): ReadonlyArray<ActivePowerUp> => ps.filter((p) => p.expiresAt > now);

const speedMultiplier = (ps: ReadonlyArray<ActivePowerUp>): number =>
  ps.reduce((m, p) => {
    if (p.kind === 'speedUp') return m * 1.5;
    if (p.kind === 'slowDown') return m * 0.5;
    return m;
  }, 1);

const bonusScore = (ps: ReadonlyArray<ActivePowerUp>): number =>
  (ps.some((p) => p.kind === 'bonus') ? 3 : 1);

const checkMatch = (s: State): State => {
  const target = lowestTarget(s.targets);
  if (!target || rowValue(s.row) !== target.value) return s;

  if (target.powerUp === 'clearBoard') {
    return {
      ...s,
      targets: [],
      exit: s.exit.concat(s.targets),
      score: s.score + bonusScore(s.powerUps),
      row: initialRow,
    };
  }

  const powerUps = target.powerUp
    ? s.powerUps.concat(activatePowerUp(target.powerUp, s.time))
    : s.powerUps;

  return {
    ...s,
    targets: s.targets.filter((t) => t.id !== target.id),
    exit: s.exit.concat(target),
    score: s.score + bonusScore(s.powerUps),
    row: initialRow,
    powerUps,
  };
};

class Tick implements Action {
  constructor(public readonly dt: number) {}
  apply = (s: State): State => {
    if (s.gameOver || s.paused) return s;
    const time = s.time + this.dt;
    const powerUps = decayPowerUps(s.powerUps, time);
    const speed = fallSpeedAt(time) * speedMultiplier(powerUps);
    const moved = s.targets.map(moveTarget(speed * this.dt));
    const onScreen = moved.filter((t) => t.y < Constants.CanvasHeight);
    const offScreen = moved.filter((t) => t.y >= Constants.CanvasHeight);
    const lowest = lowestTarget(onScreen);
    const lost = lowest !== undefined
      && lowest.y >= Constants.CheckLineY
      && rowValue(s.row) !== lowest.value;
    return {
      ...s,
      time,
      targets: onScreen,
      exit: offScreen,
      gameOver: lost,
      powerUps,
    };
  };
}

class SpawnTarget implements Action {
  constructor(
    public readonly value: number,
    public readonly powerUp: PowerUpKind | null = null,
  ) {}
  apply = (s: State): State => {
    if (s.gameOver || s.paused) return s;
    const target: Target = {
      id: String(s.objCount),
      value: this.value,
      y: 0,
      spawnTime: s.time,
      powerUp: this.powerUp,
    };
    return {
      ...s, targets: s.targets.concat(target), objCount: s.objCount + 1,
    };
  };
}

class FlipBit implements Action {
  constructor(public readonly index: number) {}
  apply = (s: State): State =>
    (s.gameOver || s.paused
      ? s
      : checkMatch({ ...s, row: toggleBit(this.index)(s.row) }));
}

class Restart implements Action {
  apply = (s: State): State => ({ ...initialState, exit: s.targets });
}

class TogglePause implements Action {
  apply = (s: State): State => ({ ...s, paused: !s.paused });
}

class ToggleBase implements Action {
  apply = (s: State): State => ({ ...s, base: s.base === 16 ? 2 : 16 });
}

const reduceState = (s: State, action: Action): State => action.apply(s);

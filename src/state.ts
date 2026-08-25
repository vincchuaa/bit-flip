export {
  rowValue, toggleBit, initialRow, initialState, Tick, FlipBit, reduceState,
};

import { Action, Bit, Constants, Row, State, Target } from './types';

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
};

// minimum-game target sequence; replaced by random values in a later phase
const hardcodedTargetValues: ReadonlyArray<number> = [26, 255, 15, 128, 51];
const SpawnIntervalMs = 3000;

const moveTarget = (dy: number) => (t: Target): Target => ({
  ...t, y: t.y + dy,
});

// closest target to the check line, since that's the only one being played
const lowestTarget = (ts: ReadonlyArray<Target>): Target | undefined =>
  ts.reduce<Target | undefined>(
    (lo, t) => (!lo || t.y > lo.y ? t : lo), undefined);

const spawnDueTargets = (s: State, elapsed: number): ReadonlyArray<Target> => {
  const due = Math.min(
    hardcodedTargetValues.length, Math.floor(elapsed / SpawnIntervalMs) + 1);
  return hardcodedTargetValues.slice(s.objCount, due).map((value, k) => ({
    id: String(s.objCount + k),
    value,
    y: 0,
    spawnTime: elapsed,
    powerUp: null,
  }));
};

const checkMatch = (s: State): State => {
  const target = lowestTarget(s.targets);
  if (!target || rowValue(s.row) !== target.value) return s;
  return {
    ...s,
    targets: s.targets.filter((t) => t.id !== target.id),
    exit: s.exit.concat(target),
    score: s.score + 1,
    row: initialRow,
  };
};

class Tick implements Action {
  constructor(public readonly elapsed: number) {}
  apply = (s: State): State => {
    if (s.gameOver) return s;
    const dt = this.elapsed - s.time;
    const moved = s.targets.map(moveTarget(Constants.InitialFallSpeed * dt));
    const onScreen = moved.filter((t) => t.y < Constants.CanvasHeight);
    const offScreen = moved.filter((t) => t.y >= Constants.CanvasHeight);
    const spawned = spawnDueTargets(s, this.elapsed);
    const lowest = lowestTarget(onScreen);
    const lost = lowest !== undefined
      && lowest.y >= Constants.CheckLineY
      && rowValue(s.row) !== lowest.value;
    return {
      ...s,
      time: this.elapsed,
      targets: onScreen.concat(spawned),
      exit: offScreen,
      objCount: s.objCount + spawned.length,
      gameOver: lost,
    };
  };
}

class FlipBit implements Action {
  constructor(public readonly index: number) {}
  apply = (s: State): State =>
    s.gameOver ? s : checkMatch({ ...s, row: toggleBit(this.index)(s.row) });
}

const reduceState = (s: State, action: Action): State => action.apply(s);

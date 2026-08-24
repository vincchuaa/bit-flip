export {
  rowValue, toggleBit, initialRow, initialState, Tick, FlipBit, reduceState,
};

import { Action, Bit, Row, State } from './types';

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

class Tick implements Action {
  constructor(public readonly elapsed: number) {}
  apply = (s: State): State => ({ ...s, time: this.elapsed });
}

class FlipBit implements Action {
  constructor(public readonly index: number) {}
  apply = (s: State): State => ({ ...s, row: toggleBit(this.index)(s.row) });
}

const reduceState = (s: State, action: Action): State => action.apply(s);

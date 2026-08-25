import { describe, expect, it } from 'vitest';
import {
  FlipBit,
  initialRow,
  initialState,
  reduceState,
  rowValue,
  Tick,
  toggleBit,
} from '../src/state';
import type { Row, Target } from '../src/types';

describe('rowValue', () => {
  it('returns 0 for an all-zero row', () => {
    expect(rowValue(initialRow)).toBe(0);
  });

  it('returns 255 for an all-one row', () => {
    const row: Row = [1, 1, 1, 1, 1, 1, 1, 1];

    expect(rowValue(row)).toBe(255);
  });

  it('treats index 0 as the most significant bit', () => {
    const row: Row = [1, 0, 0, 0, 0, 0, 0, 0];

    expect(rowValue(row)).toBe(128);
  });
});

describe('toggleBit', () => {
  it('toggles the selected bit', () => {
    expect(toggleBit(3)(initialRow)).toEqual([
      0, 0, 0, 1, 0, 0, 0, 0,
    ]);
  });

  it('restores the row when the same bit is toggled twice', () => {
    const toggled = toggleBit(3)(initialRow);

    expect(toggleBit(3)(toggled)).toEqual(initialRow);
  });

  it('does not mutate the input row', () => {
    const row: Row = [0, 0, 0, 0, 0, 0, 0, 0];

    toggleBit(3)(row);

    expect(row).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
  });
});

describe('Tick', () => {
  it('spawns the first target near the start of the game', () => {
    const result = new Tick(0).apply(initialState);

    expect(result.targets).toHaveLength(1);
  });

  it('moves existing targets downward', () => {
    const target: Target = {
      id: '0', value: 26, y: 0, spawnTime: 0, powerUp: null,
    };
    const state = { ...initialState, targets: [target], objCount: 1 };

    const result = new Tick(1000).apply(state);

    expect(result.targets[0].y).toBeGreaterThan(0);
  });

  it('ends the game when a target passes the check line unmatched', () => {
    const target: Target = {
      id: '0', value: 26, y: 550, spawnTime: 0, powerUp: null,
    };
    const state = { ...initialState, targets: [target], objCount: 1 };

    const result = new Tick(20).apply(state);

    expect(result.gameOver).toBe(true);
  });

  it('does not mutate the input state', () => {
    const before = { ...initialState };

    new Tick(1234).apply(initialState);

    expect(initialState).toEqual(before);
  });
});

describe('FlipBit', () => {
  it('removes the target and scores a point on a matching row', () => {
    const target: Target = {
      id: '0', value: 1, y: 0, spawnTime: 0, powerUp: null,
    };
    const state = { ...initialState, targets: [target], objCount: 1 };

    const result = new FlipBit(7).apply(state);

    expect(result.targets).toHaveLength(0);
    expect(result.score).toBe(1);
  });
});

describe('reduceState', () => {
  it('applies the action to the state', () => {
    const result = reduceState(initialState, new Tick(42));

    expect(result.time).toBe(42);
  });
});

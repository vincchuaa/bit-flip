import { describe, expect, it } from 'vitest';
import {
  initialRow,
  initialState,
  reduceState,
  rowValue,
  Tick,
  toggleBit,
} from '../src/state';
import type { Row } from '../src/types';

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
  it('updates only the time', () => {
    const result = new Tick(999).apply(initialState);

    expect(result).toEqual({
      ...initialState,
      time: 999,
    });
  });

  it('does not mutate the input state', () => {
    const before = { ...initialState };

    new Tick(1234).apply(initialState);

    expect(initialState).toEqual(before);
  });
});

describe('reduceState', () => {
  it('applies the action to the state', () => {
    const result = reduceState(initialState, new Tick(42));

    expect(result).toEqual({
      ...initialState,
      time: 42,
    });
  });
});
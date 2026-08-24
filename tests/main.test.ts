import { describe, expect, it } from 'vitest';
import { initialRow, rowValue, toggleBit } from '../src/state';
import type { Row } from '../src/types';

describe('rowValue', () => {
  it('is 0 for the initial (all-zero) row', () => {
    expect(rowValue(initialRow)).toBe(0);
  });

  it('is 255 for an all-one row', () => {
    const allOnes: Row = [1, 1, 1, 1, 1, 1, 1, 1];
    expect(rowValue(allOnes)).toBe(255);
  });

  it('treats index 0 as the most significant bit', () => {
    const row: Row = [1, 0, 0, 0, 0, 0, 0, 0];
    expect(rowValue(row)).toBe(128);
  });
});

describe('toggleBit', () => {
  [0, 1, 2, 3, 4, 5, 6, 7].forEach((index) => {
    it(`flips only bit ${index} from the initial row`, () => {
      const flipped = toggleBit(index)(initialRow);
      expect(rowValue(flipped)).toBe(2 ** (7 - index));
      flipped.forEach((bit, i) => {
        expect(bit).toBe(i === index ? 1 : 0);
      });
    });

    it(`round-trips bit ${index}: toggling twice restores the row`, () => {
      const twice = toggleBit(index)(toggleBit(index)(initialRow));
      expect(twice).toEqual(initialRow);
    });
  });

  it('does not mutate the input row', () => {
    const row: Row = [0, 0, 0, 0, 0, 0, 0, 0];
    toggleBit(3)(row);
    expect(row).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
  });
});

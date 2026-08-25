import { describe, expect, it } from 'vitest';
import {
  bonusScore,
  decayPowerUps,
  FlipBit,
  initialRow,
  initialState,
  reduceState,
  rowValue,
  fallSpeedAt,
  Restart,
  speedMultiplier,
  SpawnTarget,
  Tick,
  toggleBit,
  ToggleBase,
  TogglePause,
} from '../src/state';
import { nextSpawnDelay, RNG, spawnValue } from '../src/rng';
import type { ActivePowerUp, Row, Target } from '../src/types';

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

describe('fallSpeedAt', () => {
  it('increases the longer the player survives', () => {
    expect(fallSpeedAt(20000)).toBeGreaterThan(fallSpeedAt(0));
  });
});

describe('SpawnTarget', () => {
  it('adds a target with the given value at the top of the screen', () => {
    const result = new SpawnTarget(200).apply(initialState);

    expect(result.targets).toHaveLength(1);
    expect(result.targets[0]).toMatchObject({ value: 200, y: 0 });
  });
});

describe('Restart', () => {
  it('resets state but keeps active targets to signal their removal', () => {
    const target: Target = {
      id: '0', value: 1, y: 100, spawnTime: 0, powerUp: null,
    };
    const state = {
      ...initialState, targets: [target], score: 5, gameOver: true,
    };

    const result = new Restart().apply(state);

    expect(result.score).toBe(0);
    expect(result.targets).toHaveLength(0);
    expect(result.exit).toEqual([target]);
  });

  it('does not carry elapsed time across a restart', () => {
    const later = new Tick(5000).apply(initialState);
    const restarted = new Restart().apply(later);
    const nextTick = new Tick(20).apply(restarted);

    expect(nextTick.time).toBe(20);
  });
});

describe('TogglePause', () => {
  it('freezes ticking and bit flips while paused', () => {
    const paused = new TogglePause().apply(initialState);

    const ticked = new Tick(1000).apply(paused);
    const flipped = new FlipBit(0).apply(paused);

    expect(ticked).toEqual(paused);
    expect(flipped).toEqual(paused);
  });
});

describe('decayPowerUps', () => {
  it('keeps only power-ups that have not expired yet', () => {
    const active: ActivePowerUp = {
      kind: 'speedUp', activatedAt: 0, expiresAt: 5000,
    };
    const expired: ActivePowerUp = {
      kind: 'bonus', activatedAt: 0, expiresAt: 1000,
    };

    const result = decayPowerUps([active, expired], 2000);

    expect(result).toEqual([active]);
  });
});

describe('speedMultiplier', () => {
  it('speeds up when speedUp is active, slows down when slowDown is', () => {
    const speedUp: ActivePowerUp = {
      kind: 'speedUp', activatedAt: 0, expiresAt: 5000,
    };
    const slowDown: ActivePowerUp = {
      kind: 'slowDown', activatedAt: 0, expiresAt: 5000,
    };

    expect(speedMultiplier([speedUp])).toBeGreaterThan(1);
    expect(speedMultiplier([slowDown])).toBeLessThan(1);
    expect(speedMultiplier([])).toBe(1);
  });
});

describe('bonusScore', () => {
  it('awards 3 points with an active bonus, otherwise 1', () => {
    const bonus: ActivePowerUp = {
      kind: 'bonus', activatedAt: 0, expiresAt: 5000,
    };

    expect(bonusScore([bonus])).toBe(3);
    expect(bonusScore([])).toBe(1);
  });
});

describe('power-up targets', () => {
  it('activates a power-up on match instead of removing it silently', () => {
    const target: Target = {
      id: '0', value: 1, y: 0, spawnTime: 0, powerUp: 'speedUp',
    };
    const state = { ...initialState, targets: [target], objCount: 1 };

    const result = new FlipBit(7).apply(state);

    expect(result.powerUps).toHaveLength(1);
    expect(result.powerUps[0].kind).toBe('speedUp');
  });

  it('clears every target on the screen when clearBoard is matched', () => {
    const cleared: Target = {
      id: '0', value: 1, y: 50, spawnTime: 0, powerUp: 'clearBoard',
    };
    const other: Target = {
      id: '1', value: 200, y: 0, spawnTime: 0, powerUp: null,
    };
    const state = {
      ...initialState, targets: [cleared, other], objCount: 2,
    };

    const result = new FlipBit(7).apply(state);

    expect(result.targets).toHaveLength(0);
    expect(result.exit).toEqual([cleared, other]);
  });
});

describe('ToggleBase', () => {
  it('switches between base 16 and base 2', () => {
    const toBase2 = new ToggleBase().apply(initialState);
    const toBase16 = new ToggleBase().apply(toBase2);

    expect(toBase2.base).toBe(2);
    expect(toBase16.base).toBe(16);
  });
});

describe('reduceState', () => {
  it('applies the action to the state', () => {
    const result = reduceState(initialState, new Tick(42));

    expect(result.time).toBe(42);
  });
});

describe('RNG', () => {
  it('hash is deterministic for the same seed', () => {
    expect(RNG.hash(123)).toBe(RNG.hash(123));
  });

  it('spawnValue stays within 0-255', () => {
    const value = spawnValue(RNG.hash(123));

    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(255);
  });

  it('nextSpawnDelay stays within 1000-3000ms', () => {
    const delay = nextSpawnDelay(RNG.hash(123));

    expect(delay).toBeGreaterThanOrEqual(1000);
    expect(delay).toBeLessThanOrEqual(3000);
  });
});

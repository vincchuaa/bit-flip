export { RNG, spawnValue, nextSpawnDelay, spawnPowerUp };

import { PowerUpKind } from './types';

abstract class RNG {
  private static m = 0x80000000;
  private static a = 1103515245;
  private static c = 12345;

  public static hash = (seed: number) => (RNG.a * seed + RNG.c) % RNG.m;
  public static scale = (hash: number) => (2 * hash) / (RNG.m - 1) - 1;
}

// maps a hash to a target value in 0-255
const spawnValue = (seed: number): number =>
  Math.min(255, Math.floor(((RNG.scale(seed) + 1) / 2) * 256));

// maps a hash to a spawn delay in 1000-3000ms
const nextSpawnDelay = (seed: number): number =>
  1000 + ((RNG.scale(seed) + 1) / 2) * 2000;

const powerUpKinds: ReadonlyArray<PowerUpKind> =
  ['bonus', 'speedUp', 'slowDown', 'clearBoard'];

// most spawns carry no power-up; 20% chance of one, evenly split by kind
const spawnPowerUp = (seed: number): PowerUpKind | null => {
  const u = (RNG.scale(seed) + 1) / 2;
  if (u >= 0.2) return null;
  return powerUpKinds[Math.floor((u / 0.2) * powerUpKinds.length)];
};

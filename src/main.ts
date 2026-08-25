import { fromEvent, interval, merge, of, timer } from 'rxjs';
import { expand, filter, map, scan, skip } from 'rxjs/operators';
import { Constants, Event, Key } from './types';
import {
  FlipBit, initialState, reduceState, Restart, SpawnTarget, Tick,
  ToggleBase, TogglePause,
} from './state';
import { nextSpawnDelay, RNG, spawnPowerUp, spawnValue } from './rng';
import { updateView } from './view';

const bitKeys: ReadonlyArray<Key> = [
  'Digit1', 'Digit2', 'Digit3', 'Digit4',
  'Digit5', 'Digit6', 'Digit7', 'Digit8',
];

const key$ = (e: Event, k: Key) =>
  fromEvent<KeyboardEvent>(document, e).pipe(
    filter(({ code }) => code === k),
    filter(({ repeat }) => !repeat),
  );

type SpawnSeed = Readonly<{ seed: number, delay: number }>;

const nextSpawnSeed = (s: SpawnSeed): SpawnSeed => {
  const seed = RNG.hash(s.seed);
  return { seed, delay: nextSpawnDelay(seed) };
};

function main(): void {
  const svg = document.getElementById('svgCanvas')!;

  const tick$ = interval(Constants.FrameRate)
    .pipe(map(() => new Tick(Constants.FrameRate)));

  const flipKeys$ = merge(
    ...bitKeys.map((code, i) =>
      key$('keydown', code).pipe(map(() => new FlipBit(i)))),
  );

  const digitClicks$ = fromEvent<MouseEvent>(svg, 'click').pipe(
    map((e) => (e.target as Element).id),
    filter((id) => id.startsWith('digit')),
    map((id) => new FlipBit(Number(id.slice(5)))),
  );

  const spawnTiming$ = of<SpawnSeed>({ seed: 987654321, delay: 0 }).pipe(
    expand((s) => timer(nextSpawnSeed(s).delay)
      .pipe(map(() => nextSpawnSeed(s)))),
    skip(1),
  );
  const spawnTarget$ = spawnTiming$.pipe(
    map(({ seed }) => new SpawnTarget(spawnValue(seed), spawnPowerUp(seed))),
  );

  const restartBtn = document.getElementById('restartBtn')!;
  const restart$ = merge(
    fromEvent(restartBtn, 'click'),
    key$('keydown', 'KeyR'),
  ).pipe(map(() => new Restart()));

  const pauseBtn = document.getElementById('pauseBtn')!;
  const pause$ = merge(
    fromEvent(pauseBtn, 'click'),
    key$('keydown', 'KeyP'),
  ).pipe(map(() => new TogglePause()));

  const baseBtn = document.getElementById('baseBtn')!;
  const base$ = fromEvent(baseBtn, 'click').pipe(map(() => new ToggleBase()));

  merge(
    tick$, flipKeys$, digitClicks$, spawnTarget$, restart$, pause$, base$,
  )
    .pipe(scan(reduceState, initialState))
    .subscribe(updateView);
}

if (typeof window !== 'undefined') {
  window.onload = main;
}

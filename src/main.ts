import { fromEvent, interval, merge } from 'rxjs';
import { filter, map, scan } from 'rxjs/operators';
import { Constants, Event, Key } from './types';
import { FlipBit, initialState, reduceState, Tick } from './state';
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

function main(): void {
  const tick$ = interval(Constants.FrameRate).pipe(map((e) => new Tick(e)));

  const flipKeys$ = merge(
    ...bitKeys.map((code, i) =>
      key$('keydown', code).pipe(map(() => new FlipBit(i)))),
  );

  merge(tick$, flipKeys$)
    .pipe(scan(reduceState, initialState))
    .subscribe(updateView);
}

if (typeof window !== 'undefined') {
  window.onload = main;
}

export { updateView };

import { Constants, State, Target } from './types';

const cellWidth = Constants.CanvasWidth / 8;

const createDigit = (svg: Element, id: string, i: number): Element => {
  const el = document.createElementNS(svg.namespaceURI, 'text');
  el.setAttribute('id', id);
  el.setAttribute('x', String(cellWidth * i + cellWidth / 2 - 10));
  el.setAttribute('y', '300');
  el.setAttribute('fill', 'white');
  el.setAttribute('font-size', '32');
  svg.appendChild(el);
  return el;
};

const updateDigit = (svg: Element) => (bit: number, i: number): void => {
  const id = `digit${i}`;
  const el = document.getElementById(id) ?? createDigit(svg, id, i);
  el.textContent = String(bit);
};

const targetId = (t: Target) => `target${t.id}`;

const createTarget = (svg: Element, id: string): Element => {
  const el = document.createElementNS(svg.namespaceURI, 'text');
  el.setAttribute('id', id);
  el.setAttribute('x', String(Constants.CanvasWidth / 2 - 15));
  el.setAttribute('fill', 'yellow');
  el.setAttribute('font-size', '28');
  svg.appendChild(el);
  return el;
};

const updateTarget = (svg: Element) => (t: Target): void => {
  const id = targetId(t);
  const el = document.getElementById(id) ?? createTarget(svg, id);
  el.setAttribute('y', String(t.y));
  el.textContent = t.value.toString(16).toUpperCase().padStart(2, '0');
};

const removeExited = (exit: ReadonlyArray<Target>): void => {
  exit.forEach((t) => document.getElementById(targetId(t))?.remove());
};

const showGameOver = (svg: Element): void => {
  if (document.getElementById('gameOver')) return;
  const el = document.createElementNS(svg.namespaceURI, 'text');
  el.setAttribute('id', 'gameOver');
  el.setAttribute('x', String(Constants.CanvasWidth / 2 - 70));
  el.setAttribute('y', String(Constants.CanvasHeight / 2));
  el.setAttribute('fill', 'red');
  el.setAttribute('font-size', '36');
  el.textContent = 'Game Over';
  svg.appendChild(el);
};

const updateView = (s: State): void => {
  const readout = document.getElementById('readout');
  if (readout) readout.textContent = `time: ${s.time}`;

  const svg = document.getElementById('svgCanvas');
  if (!svg) return;

  s.row.forEach(updateDigit(svg));
  s.targets.forEach(updateTarget(svg));
  removeExited(s.exit);
  if (s.gameOver) showGameOver(svg);
};

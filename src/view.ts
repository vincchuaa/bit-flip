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
  svg.appendChild(el);
  return el;
};

const updateTarget = (svg: Element, base: number) => (t: Target): void => {
  const id = targetId(t);
  const el = document.getElementById(id) ?? createTarget(svg, id);
  const digits = base === 2 ? 8 : 2;
  el.setAttribute('y', String(t.y));
  el.setAttribute('fill', t.powerUp ? 'cyan' : 'yellow');
  el.setAttribute('font-size', base === 2 ? '18' : '28');
  el.setAttribute('x', String(Constants.CanvasWidth / 2 - digits * 6));
  el.textContent = t.value.toString(base).toUpperCase().padStart(digits, '0');
};

const removeExited = (exit: ReadonlyArray<Target>): void => {
  exit.forEach((t) => document.getElementById(targetId(t))?.remove());
};

const showOverlay = (
  svg: Element, id: string, text: string, y: number,
): void => {
  if (document.getElementById(id)) return;
  const el = document.createElementNS(svg.namespaceURI, 'text');
  el.setAttribute('id', id);
  el.setAttribute('x', String(Constants.CanvasWidth / 2 - 70));
  el.setAttribute('y', String(y));
  el.setAttribute('fill', 'red');
  el.setAttribute('font-size', '36');
  el.textContent = text;
  svg.appendChild(el);
};

const toggleOverlay = (
  svg: Element, show: boolean, id: string, text: string, y: number,
): void => {
  if (show) showOverlay(svg, id, text, y);
  else document.getElementById(id)?.remove();
};

const updateView = (s: State): void => {
  const readout = document.getElementById('readout');
  if (readout) readout.textContent = `time: ${s.time}`;

  const score = document.getElementById('score');
  if (score) score.textContent = `Score: ${s.score}`;

  const powerUps = document.getElementById('powerUps');
  if (powerUps) {
    powerUps.textContent = s.powerUps.length
      ? `Active: ${s.powerUps.map((p) => p.kind).join(', ')}`
      : '';
  }

  const pauseBtn = document.getElementById('pauseBtn');
  if (pauseBtn) pauseBtn.textContent = s.paused ? 'Resume' : 'Pause';

  const baseBtn = document.getElementById('baseBtn');
  if (baseBtn) baseBtn.textContent = s.base === 2 ? 'Base 16' : 'Base 2';

  const svg = document.getElementById('svgCanvas');
  if (!svg) return;

  s.row.forEach(updateDigit(svg));
  s.targets.forEach(updateTarget(svg, s.base));
  removeExited(s.exit);

  const midY = Constants.CanvasHeight / 2;
  toggleOverlay(svg, s.gameOver, 'gameOver', 'Game Over', midY);
  toggleOverlay(svg, s.paused, 'paused', 'Paused', midY - 50);
};

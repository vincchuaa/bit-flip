// renders game state to the SVG canvas and DOM; the only file with side effects
export { updateView };

import { Constants, State, Target } from './types';

const cellWidth = Constants.CanvasWidth / 8;
const rowY = Constants.CheckLineY + 40;

const createDigit = (svg: Element, i: number): void => {
  const g = document.createElementNS(svg.namespaceURI, 'g');
  g.setAttribute('id', `digitCell${i}`);
  g.setAttribute('data-digit', String(i));

  const rect = document.createElementNS(svg.namespaceURI, 'rect');
  rect.setAttribute('class', 'digit-cell-bg');
  rect.setAttribute('x', String(cellWidth * i + 4));
  rect.setAttribute('y', String(rowY - 34));
  rect.setAttribute('width', String(cellWidth - 8));
  rect.setAttribute('height', '48');
  rect.setAttribute('rx', '6');
  g.appendChild(rect);

  const text = document.createElementNS(svg.namespaceURI, 'text');
  text.setAttribute('id', `digitText${i}`);
  text.setAttribute('class', 'digit-cell-text');
  text.setAttribute('x', String(cellWidth * i + cellWidth / 2));
  text.setAttribute('y', String(rowY));
  g.appendChild(text);

  svg.appendChild(g);
};

const updateDigit = (svg: Element) => (bit: number, i: number): void => {
  if (!document.getElementById(`digitText${i}`)) createDigit(svg, i);
  const text = document.getElementById(`digitText${i}`)!;
  const cell = document.getElementById(`digitCell${i}`)!;
  text.textContent = String(bit);
  cell.querySelector('.digit-cell-bg')!
    .classList.toggle('on', bit === 1);
};

const targetId = (t: Target) => `target${t.id}`;

const createTarget = (svg: Element, id: string): Element => {
  const g = document.createElementNS(svg.namespaceURI, 'g');
  g.setAttribute('id', id);

  const rect = document.createElementNS(svg.namespaceURI, 'rect');
  rect.setAttribute('class', 'target-cell-bg');
  rect.setAttribute('rx', '6');
  g.appendChild(rect);

  const text = document.createElementNS(svg.namespaceURI, 'text');
  text.setAttribute('class', 'target-cell-text');
  g.appendChild(text);

  svg.appendChild(g);
  return g;
};

const updateTarget = (svg: Element, base: number) => (t: Target): void => {
  const id = targetId(t);
  const g = document.getElementById(id) ?? createTarget(svg, id);
  const rect = g.querySelector('rect')!;
  const text = g.querySelector('text')!;
  const digits = base === 2 ? 8 : 2;
  const width = base === 2 ? 100 : 44;
  const midX = Constants.CanvasWidth / 2;

  rect.setAttribute('x', String(midX - width / 2));
  rect.setAttribute('y', String(t.y - 18));
  rect.setAttribute('width', String(width));
  rect.setAttribute('height', '32');
  rect.classList.toggle('power', t.powerUp !== null);

  text.setAttribute('x', String(midX));
  text.setAttribute('y', String(t.y + 6));
  text.classList.toggle('power', t.powerUp !== null);
  text.textContent = t.value.toString(base).toUpperCase().padStart(digits, '0');
};

const removeExited = (exit: ReadonlyArray<Target>): void => {
  exit.forEach((t) => document.getElementById(targetId(t))?.remove());
};

const showOverlay = (
  svg: Element, id: string, text: string, y: number, kind: string,
): void => {
  if (document.getElementById(id)) return;
  const el = document.createElementNS(svg.namespaceURI, 'text');
  el.setAttribute('id', id);
  el.setAttribute('class', `overlay-text ${kind}`);
  el.setAttribute('x', String(Constants.CanvasWidth / 2));
  el.setAttribute('y', String(y));
  el.setAttribute('font-size', '32');
  el.textContent = text;
  svg.appendChild(el);
};

const toggleOverlay = (
  svg: Element, show: boolean, id: string, text: string, y: number,
  kind: string,
): void => {
  if (show) showOverlay(svg, id, text, y, kind);
  else document.getElementById(id)?.remove();
};

const updateView = (s: State): void => {
  const readout = document.getElementById('readout');
  if (readout) readout.textContent = `time: ${Math.floor(s.time / 1000)}s`;

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
  toggleOverlay(svg, s.gameOver, 'gameOver', 'Game Over', midY, 'danger');
  toggleOverlay(svg, s.paused, 'paused', 'Paused', midY - 50, 'info');
};

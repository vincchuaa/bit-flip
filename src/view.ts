export { updateView };

import { Constants, State } from './types';

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

const updateView = (s: State): void => {
  const readout = document.getElementById('readout');
  if (readout) readout.textContent = `time: ${s.time}`;

  const svg = document.getElementById('svgCanvas');
  if (svg) s.row.forEach(updateDigit(svg));
};

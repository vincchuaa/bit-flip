export { rowValue, toggleBit, initialRow };

import { Bit, Row } from './types';

const initialRow: Row = [0, 0, 0, 0, 0, 0, 0, 0];

const rowValue = (row: Row): number =>
  row.reduce<number>((acc, bit) => (acc << 1) | bit, 0);

const toggleBit = (index: number) => (row: Row): Row =>
  row.map((bit, i) => (i === index ? ((bit === 0 ? 1 : 0) as Bit) : bit));

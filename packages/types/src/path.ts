import type { Point } from './point';

export type PathCommandType =
  | 'M'
  | 'm'
  | 'L'
  | 'l'
  | 'H'
  | 'h'
  | 'V'
  | 'v'
  | 'C'
  | 'c'
  | 'S'
  | 's'
  | 'Q'
  | 'q'
  | 'T'
  | 't'
  | 'A'
  | 'a'
  | 'Z'
  | 'z';

export interface PathCommand {
  id: string;
  type: string;
  params: number[];
}

export interface PathAnchorCommand {
  id: string;
  type: 'M' | 'L' | 'A' | 'C' | 'Z';
  params: number[];
  start: Point;
  end: Point;
}

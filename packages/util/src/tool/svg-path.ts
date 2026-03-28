import type { PathCommand } from '@idraw/types';

const cmdReg = /([astvzqmhlc])([^astvzqmhlc]*)/gi;
// const numReg = /-?[0-9]*\.?[0-9]+(?:e[-+]?\d+)?/gi;
const numReg = /(-?\d+(?:\.\d+)?)/gi;

export function parseSVGPath(path: string): PathCommand[] {
  const commands: PathCommand[] = [];
  path.replace(cmdReg, (match: string, cmd: string, paramStr: string) => {
    const matchParams = paramStr.match(numReg);
    const params = matchParams ? matchParams.map(Number) : [];
    const command: PathCommand = {
      type: cmd,
      params,
    } as unknown as PathCommand;
    commands.push(command);
    return match;
  });
  return commands;
}

export function convertPathCommandsToStr(commands: PathCommand[]): string {
  let path: string = '';
  commands.forEach((item) => {
    path += item.type + item.params?.join?.(' ');
  });
  return path;
}

// // Just support 'M', 'm', 'L', 'l', 'H', 'h', 'V', 'v', 'C', 'c', 'Q', 'q', 'T', 't'
// // TODO 'A', 'a', 'Z', 'z', 'S', 's',
// export function calcSVGPathSize(commands: PathCommand[]): MaterialSize {
//   const points: [] = [];

//   // TODO
//   let x = 0;
//   let y = 0;
//   let w = 0;
//   let h = 0;
//   return { x, y, w, h };
// }

// type FilterSVGPathResult = MaterialSize & { attributes: { commands: PathCommand[] } };
// export function filterSVGPath(commands: PathCommand[]): FilterSVGPathResult {
//   const filteredCommands: PathCommand[] = [];
//   // TODO
//   const result: FilterSVGPathResult = {
//     x: 0,
//     y: 0,
//     h: 0,
//     w: 0,
//     attributes: {
//       commands: filteredCommands
//     }
//   };

//   return result;
// }

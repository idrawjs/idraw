import { StrictMaterial, VirtualPathAttributes, CalcVirtualAttributesOptions } from '@idraw/types';
import { convertPathCommandsToACLMZ, scalePathCommands } from '@idraw/util';
import { calcVirtualBaseAttributes } from './base';

export function calcVirtualPathAttributes(
  mtrl: StrictMaterial<'path'>,
  opts: CalcVirtualAttributesOptions
): VirtualPathAttributes {
  const { dpr } = opts;
  const attributes: VirtualPathAttributes = { ...calcVirtualBaseAttributes(mtrl, opts), anchorCommands: [] };
  const anchorCommands = convertPathCommandsToACLMZ(mtrl.commands || []);

  attributes.anchorCommands = anchorCommands;
  attributes.commands = scalePathCommands(mtrl.commands, dpr, dpr);

  return attributes;
}

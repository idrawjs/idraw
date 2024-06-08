import { pickFile } from '@idraw/util';

export function pickFigmaFile(opts: { accept?: string; success: (data: { file: File }) => void; error?: (err: Error | any) => void }) {
  const { success, error } = opts;
  pickFile({
    accept: '*',
    success,
    error
  });
}

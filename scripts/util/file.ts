import fs from 'fs';
import path from 'path';

export function removeFullDir(dirPath: string) {
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    fs.rmSync(dirPath, { recursive: true });
  }
}

export function projectRootPath(...args: string[]) {
  const pathList = Array.from(args);
  const baseDir = path.join(__dirname, '..', '..');
  return path.join(baseDir, ...pathList);
}

export function readJSONFile(...args: string[]) {
  const filePath = projectRootPath(...args);
  const jsonStr = fs.readFileSync(filePath, { encoding: 'utf8' });
  const json = JSON.parse(jsonStr);
  return json;
}

export function writeJSONFile(filePath: string, json: any) {
  const fullPath = projectRootPath(filePath);
  const jsonStr = JSON.stringify(json, null, 2);
  fs.writeFileSync(fullPath, jsonStr);
}

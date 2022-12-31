import fs from 'fs';
import path from 'path';

export function resolvePackagePath(...args: string[]) {
  const pathList = Array.from(args);
  const baseDir = path.join(resolveProjectPath(), 'packages');
  return path.join(baseDir, ...pathList);
}

export function resolveProjectPath(...args: string[]) {
  const pathList = Array.from(args);
  const baseDir = path.join(__dirname, '..', '..');
  return path.join(baseDir, ...pathList);
}

export function getTsConfig() {
  const configPath = resolveProjectPath('tsconfig.json');
  const configStr = fs.readFileSync(configPath, { encoding: 'utf8' });
  const config = JSON.parse(configStr);
  return config;
}

module.exports = {
  resolveProjectPath,
  resolvePackagePath,
  getTsConfig
};

import fs from 'fs';
import path from 'path';

export function joinPackagePath(...args: string[]) {
  const pathList = Array.from(args);
  const baseDir = path.join(joinProjectPath(), 'packages');
  return path.join(baseDir, ...pathList);
}

export function joinProjectPath(...args: string[]) {
  const pathList = Array.from(args);
  const baseDir = path.join(__dirname, '..', '..');
  return path.join(baseDir, ...pathList);
}

export function getTsConfig() {
  const configPath = joinProjectPath('tsconfig.web.json');
  const configStr = fs.readFileSync(configPath, { encoding: 'utf8' });
  const config = JSON.parse(configStr);
  return config;
}

module.exports = {
  joinProjectPath,
  joinPackagePath,
  getTsConfig
};

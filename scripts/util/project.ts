import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';
import { projectRootPath } from './file';

export function joinPackagePath(...args: string[]) {
  const pathList = Array.from(args);
  const baseDir = path.join(joinProjectPath(), 'packages');
  return path.join(baseDir, ...pathList);
}

export function joinProjectPath(...args: string[]) {
  return projectRootPath(...args);
}

export function getTsConfig() {
  const configPath = joinProjectPath('tsconfig.web.json');
  const configStr = fs.readFileSync(configPath, { encoding: 'utf8' });
  const config = JSON.parse(configStr);
  return config;
}

export function getRootPackageJSON() {
  const configPath = joinProjectPath('package.json');
  const configStr = fs.readFileSync(configPath, { encoding: 'utf8' });
  const config = JSON.parse(configStr);
  return config;
}

export function getAllSubPackageDirs() {
  const pkgDirs = globSync('*', {
    cwd: joinProjectPath('packages'),
    absolute: false
  });
  return pkgDirs;
}

module.exports = {
  joinProjectPath,
  joinPackagePath,
  getTsConfig,
  getRootPackageJSON,
  getAllSubPackageDirs
};

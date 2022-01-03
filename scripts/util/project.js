const path = require('path');
const fs = require('fs');

function resolvePackagePath() {
  const pathList = Array.from(arguments);
  const baseDir = path.join(resolveProjectPath(), 'packages');
  return path.join(baseDir, ...pathList);
}

function resolveProjectPath() {
  const pathList = Array.from(arguments);
  const baseDir = path.join(__dirname, '..', '..');
  return path.join(baseDir, ...pathList);
}

function getTsConfig() {
  const configPath = resolveProjectPath('tsconfig.json')
  const configStr = fs.readFileSync(configPath, { encoding: 'utf8' });
  const config = JSON.parse(configStr);
  return config;
}


module.exports = {
  resolveProjectPath,
  resolvePackagePath,
  getTsConfig,
}
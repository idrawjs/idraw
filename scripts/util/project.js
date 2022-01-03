const path = require('path');

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


module.exports = {
  resolveProjectPath,
  resolvePackagePath,
}
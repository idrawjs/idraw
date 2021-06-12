const packages = [
  {
    dirName: 'util',
    globalName: 'iDraw.util',
  },
  {
    dirName: 'board',
    globalName: 'iDraw.Board',
  },
  {
    dirName: 'core',
    globalName: 'iDraw.Core',
  },
  {
    dirName: 'idraw',
    globalName: 'iDraw.IDraw',
  },
];

function getTargetPackage(cmdTarget = '') {
  let target = '';
  if (typeof cmdTarget === 'string') {
    target = cmdTarget.replace(/^--target-pkg\=/ig, '');
  }
  let pkgs = [];
  let targetIndex = -1;
  for (let i = 0; i < packages.length; i ++) {
    if (packages[i] && packages[i].dirName === target) {
      targetIndex = i;
      break;
    }
  }
  if (targetIndex >= 0) {
    pkgs = [packages[targetIndex]];
  } else {
    pkgs = packages;
  }
  return pkgs
}

module.exports = {
  packages,
  getTargetPackage,
}
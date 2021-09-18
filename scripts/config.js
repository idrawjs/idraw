const packages = [
  {
    dirName: 'util',
    globalName: 'iDrawUtil',
  },
  {
    dirName: 'board',
    globalName: 'iDrawBoard',
  },
  // {
  //   dirName: 'kernal',
  //   globalName: 'iDrawKernal',
  // },
  {
    dirName: 'core',
    globalName: 'iDrawCore',
  },
  {
    dirName: 'idraw',
    globalName: 'iDraw',
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
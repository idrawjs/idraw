const ts = require('typescript');
// const babel = require('@babel/core');
const glob = require("glob");
const { packages } = require('./config');
const { resolvePackagePath, getTsConfig } = require('./util/project');

build();

async function build() {
  packages.forEach(async (pkg) => {
    buildPackage(pkg.dirName);
  });
}

function buildPackage(dirName) {
  const pattern = '**/*.ts';
  const cwd = resolvePackagePath(dirName, 'src');
  const files = glob.sync(pattern, { cwd, });

  const targetFiles = files.map((file) => {
    return resolvePackagePath(dirName, 'src', file);
  });

  // build ts -> esm
  {
    const tsConfig = getTsConfig();
    const compilerOptions = tsConfig.compilerOptions;
    compilerOptions.target = ts.ScriptTarget.ES2015;
    compilerOptions.moduleResolution = ts.ModuleResolutionKind.NodeJs;
    compilerOptions.declaration = true;
    compilerOptions.outDir = resolvePackagePath(dirName, 'esm');
    compilerOptions.rootDir  = resolvePackagePath(dirName, 'src');
    const program = ts.createProgram(targetFiles, compilerOptions);
    program.emit();
  }
}


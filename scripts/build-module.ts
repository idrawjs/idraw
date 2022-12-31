import ts from 'typescript';
import path from 'path';
import fs from 'fs-extra';
import glob from 'glob';
import { packages } from './config';
import { resolvePackagePath, getTsConfig } from './util/project';

build();

async function build() {
  for (let i = 0; i < packages.length; i++) {
    const pkg = packages[i];
    const { dirName } = pkg;
    const pkgDir = path.resolve(`packages/${dirName}`);
    console.log(`Start to build ESM for ${dirName}`);
    console.log(`Remove packages/${dirName}/dist/`);
    await fs.remove(`${pkgDir}/dist`);
    buildPackage(dirName);
    console.log(`Build ESM of ${dirName} successfully!`);
  }
}

function buildPackage(dirName) {
  const pattern = '**/*.ts';
  const cwd = resolvePackagePath(dirName, 'src');
  const files = glob.sync(pattern, { cwd });

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
    compilerOptions.outDir = resolvePackagePath(dirName, 'dist', 'esm');
    compilerOptions.rootDir = resolvePackagePath(dirName, 'src');
    const program = ts.createProgram(targetFiles, compilerOptions);
    program.emit();
  }
}

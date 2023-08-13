import ts from 'typescript';
import { Project } from 'ts-morph';
import type { CompilerOptions } from 'ts-morph';
import path from 'path';
import * as glob from 'glob';
import { packages } from './config';
import { joinPackagePath, joinProjectPath } from './util/project';
import { removeFullDir } from './util/file';

build();

async function build() {
  for (let i = 0; i < packages.length; i++) {
    const pkg = packages[i];
    const { dirName } = pkg;
    const pkgDir = path.resolve(`packages/${dirName}`);
    console.log(`Start to build ESM for ${dirName}`);
    console.log(`Remove packages/${dirName}/dist/`);
    removeFullDir(`${pkgDir}/dist`);
    buildPackage(dirName);
    console.log(`Build ESM of ${dirName} successfully!`);
  }
}

function buildPackage(dirName: string) {
  const pattern = '**/*.ts';
  const cwd = joinPackagePath(dirName, 'src');
  const files = glob.sync(pattern, { cwd });

  const targetFiles = files.map((file) => {
    return joinPackagePath(dirName, 'src', file);
  });

  // build ts -> esm
  {
    // const tsConfig = getTsConfig();
    // const compilerOptions = tsConfig.compilerOptions;
    const compilerOptions: CompilerOptions = {
      noUnusedLocals: true,

      declaration: true,
      sourceMap: false,
      target: ts.ScriptTarget.ES2015,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      allowJs: false,
      strict: true,
      experimentalDecorators: true,
      resolveJsonModule: true,
      esModuleInterop: true,
      removeComments: true,
      // lib: ['ES2016', 'dom'],
      outDir: joinPackagePath(dirName, 'dist', 'esm'),
      rootDir: joinPackagePath(dirName, 'src'),
      skipLibCheck: true
    };
    const project = new Project({
      compilerOptions
      // tsConfigFilePath: joinProjectPath('tsconfig.web.json')
    });

    const program = ts.createProgram(targetFiles, compilerOptions);

    // const diagnostics = ts.getPreEmitDiagnostics(program);
    // if (diagnostics.length) {
    //   console.error(diagnostics);
    //   for (const diagnostic of diagnostics) {
    //     console.log(JSON.stringify(diagnostic.messageText, null, 2));
    //   }
    //   throw Error('TS build error!');
    // }
    const diagnostics = project.getPreEmitDiagnostics();
    if (diagnostics.length > 0) {
      console.error(project.formatDiagnosticsWithColorAndContext(diagnostics));
      throw Error('TS build error!');
    }

    program.emit();
  }
}

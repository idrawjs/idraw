import process from 'process';
import path from 'path';
import * as rollup from 'rollup';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import cleanup from 'rollup-plugin-cleanup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import { packages } from './config';
import dtsPlugin from './util/dts-plugin';
import stylePlugin from './util/style-plugin';
// const cleanPlugin = require('./util/clean-plugin');

const resolveFile = function (names = []) {
  return path.join(__dirname, '..', 'packages', ...names);
};

const modules = [];
const external = ['@idraw/types', '@idraw/util', '@idraw/board', '@idraw/core'];

for (let i = 0; i < packages.length; i++) {
  const pkg = packages[i];
  if (process.env.BUILD_MODE === 'mini') {
    // modules.push({
    //   input: resolveFile([pkg.dirName, 'src', 'index.ts']),
    //   output: resolveFile([pkg.dirName, 'dist', 'index.global.min.js']),
    //   name: pkg.globalName,
    //   format: 'iife',
    //   plugins: [],
    // });
  } else {
    modules.push({
      input: resolveFile([pkg.dirName, 'src', 'default.ts']),
      output: resolveFile([pkg.dirName, 'dist', 'index.global.js']),
      name: pkg.globalName,
      format: 'iife',
      plugins: []
    });
    // modules.push({
    //   input: resolveFile([pkg.dirName, 'src', 'index.ts']),
    //   output: resolveFile([pkg.dirName, 'dist', 'index.global.min.js']),
    //   name: pkg.globalName,
    //   format: 'iife',
    //   plugins: [],
    // });
    modules.push({
      input: resolveFile([pkg.dirName, 'src', 'default.ts']),
      output: resolveFile([pkg.dirName, 'dist', 'index.cjs.js']),
      name: pkg.globalName,
      format: 'cjs',
      exports: 'default',
      // plugins: [dtsPlugin(pkg.dirName),],
      plugins: [],
      external
    });
    modules.push({
      input: resolveFile([pkg.dirName, 'src', 'esm.ts']),
      output: resolveFile([pkg.dirName, 'dist', 'index.esm.js']),
      name: pkg.globalName,
      esModule: true,
      format: 'es',
      external,
      plugins: [dtsPlugin(pkg.dirName)]
    });
  }
}

function createConfigItem(params, opts = {}) {
  const {
    input,
    output,
    name,
    format,
    plugins = [],
    esModule,
    exports
  } = params;
  const prodMiniConfig = [
    terser({
      output: {
        beautify: false,
        comments: false,
        indent_level: 2,
        quote_style: 3
      }
    })
  ];
  return {
    input: input,
    output: {
      file: output,
      format,
      name: name,
      esModule: esModule === true,
      // sourcemap: true,
      exports
    },
    plugins: [
      ...[
        stylePlugin(),
        nodeResolve(),
        typescript({
          tsconfig: path.resolve(__dirname, '..', 'tsconfig.json'),
          tsconfigOverride: {}
        }),
        json()
      ],
      ...plugins,
      ...[
        // cleanPlugin({
        //   sourcemap: process.env.NODE_ENV === 'development',
        // }),
        cleanup({
          comments: 'none'
        })
      ],
      ...(opts.minify === true ? prodMiniConfig : [])
    ]
  };
}

function createDevConfig(mods) {
  const configs = mods.map((mod) => {
    const cfg = createConfigItem(mod, {
      minify: mod.output.endsWith('.min.js')
    });
    return cfg;
  });
  return configs;
}

export async function buildByRollup() {
  const configs = createDevConfig(modules);
  for (let i = 0; i < configs.length; i++) {
    const config = configs[i];
    const inputOptions = config;
    const outputOptions = config.output;
    // create a bundle
    const bundle = await rollup.rollup(inputOptions);

    console.log(`Start compile ${path.basename(inputOptions.input)}`);
    await bundle.generate(outputOptions);
    // or write the bundle to disk
    await bundle.write(outputOptions);
    console.log(`End compile ${path.basename(outputOptions.file)}`);
  }
}

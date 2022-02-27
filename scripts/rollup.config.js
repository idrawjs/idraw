const process = require('process');
const path = require('path');
const typescript = require('rollup-plugin-typescript2');
const { terser } = require('rollup-plugin-terser');
const cleanup = require('rollup-plugin-cleanup');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const json = require('@rollup/plugin-json');
const { getTargetPackage } = require('./config');
const dtsPlugin = require('./util/dts-plugin');
const stylePlugin = require('./util/style-plugin');
// const cleanPlugin = require('./util/clean-plugin');

const resolveFile = function(names = []) {
  return path.join(__dirname, '..', 'packages', ...names)
}
const targetMod = process.argv[5] || process.argv[4];
const packages = getTargetPackage(targetMod);

const modules = [];
const external = [ '@idraw/types', '@idraw/util', '@idraw/board', '@idraw/core' ];

for(let i = 0; i < packages.length; i++) {
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
      external,
    });
    modules.push({
      input: resolveFile([pkg.dirName, 'src', 'default.ts']),
      output: resolveFile([pkg.dirName, 'dist', 'index.esm.js']),
      name: pkg.globalName,
      esModule: true,
      format: 'es',
      external,
      plugins: [dtsPlugin(pkg.dirName),]
    });
  }
}


function createConfigItem(params, opts = {}) {
  const { input, output, name, format, plugins = [], esModule, exports} = params;
  return {
    input: input,
    output: {
      file:output,
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
        json(),
      ],
      ...plugins,
      ...[
        // cleanPlugin({
        //   sourcemap: process.env.NODE_ENV === 'development',
        // }),
        cleanup({
          comments: 'none',
        }),
      ],
      ...(opts.minify === true ? [
        terser({
          output: {
            beautify: false,
            comments: false,
            indent_level: 2,
            quote_style: 3,
          }
        })
      ] : [])
    ],
  };
}

function createDevConfig(mods) {
  const configs = mods.map((mod) => {
    const cfg = createConfigItem(mod, {
      minify: mod.output.endsWith('.min.js'),
    });
    return cfg;
  });
  return configs;
}

module.exports = createDevConfig(modules);








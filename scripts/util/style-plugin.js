const postcss = require('rollup-plugin-postcss');
const less = require('less');

module.exports =  function() {
  return postcss({
    extract: false,
    minimize: true,
    process: processLess,
  })
}

const processLess = function(context, payload) {
  return new Promise(( resolve, reject ) => {
    less.render({
      file: context
    }, function(err, result) {
      if( !err ) {
        resolve(result);
      } else {
        reject(err);
      }
    });

    less.render(context, {})
    .then(function(output) {
      // output.css = string of css
      // output.map = string of sourcemap
      // output.imports = array of string filenames of the imports referenced
      if( output && output.css ) {
        resolve(output.css);
      } else {
        reject({})
      }
    },
    function(err) {
      reject(err)
    });

  })
}

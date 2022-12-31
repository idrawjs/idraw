// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import postcss from 'rollup-plugin-postcss';
import less from 'less';

const processLess = function (context) {
  return new Promise((resolve, reject) => {
    less.render(
      {
        file: context
      },
      function (err, result) {
        if (!err) {
          resolve(result);
        } else {
          reject(err);
        }
      }
    );

    less.render(context, {}).then(
      function (output) {
        // output.css = string of css
        // output.map = string of sourcemap
        // output.imports = array of string filenames of the imports referenced
        if (output && output.css) {
          resolve(output.css);
        } else {
          reject({});
        }
      },
      function (err) {
        reject(err);
      }
    );
  });
};

export default function () {
  return postcss({
    extract: false,
    minimize: true,
    process: processLess
  });
}

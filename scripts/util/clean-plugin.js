const extname = require("path").extname;
const { createFilter } = require('@rollup/pluginutils');
const MagicString = require('magic-string');

module.exports = function cleanPlugin(options = {}) {
  const filter = createFilter(options.include, options.exclude);
  const sourcemap = options.sourcemap === true;

	return {
		name: 'clean-plugin',

		transform (code, id) {
      if (!filter(id) || !(['.js', '.ts'].indexOf(extname(id)) >= 0)) return;

      let codeStr = `${code}`;
      const magic = new MagicString(codeStr);
      if (sourcemap === true) {
        codeStr = codeStr.replace(/\/\*\!([^\\]+)\*\//gi, function(match, offset) {
          const start = offset;
          const end = offset + match.length;
          magic.overwrite(start, end, '');
          return '';
        });
      }
      const resultCode = magic.toString();
      let resultMap = false;
      if (sourcemap === true) {
        resultMap = magic.generateMap({
          hires: true,
        });
      }
			return {
				code: resultCode,
				map: resultMap,
      };
    }
    
	};
}
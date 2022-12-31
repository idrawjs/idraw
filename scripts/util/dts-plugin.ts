// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor';

module.exports = function myPlugin(pkgName) {
  return {
    name: 'dts-plugin', // this name will show up in warnings and errors
    async closeBundle() {
      // build types
      const target = pkgName;
      const pkgDir = path.join(__dirname, '..', '..', 'packages', `${target}`);
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pkg = require(`${pkgDir}/package.json`);

      const extractorConfigPath = path.resolve(pkgDir, `api-extractor.json`);
      const extractorConfig =
        ExtractorConfig.loadFileAndPrepare(extractorConfigPath);
      const extractorResult = Extractor.invoke(extractorConfig, {
        localBuild: true,
        showVerboseMessages: true
      });

      if (extractorResult.succeeded) {
        // concat additional d.ts to rolled-up dts
        const typesDir = path.resolve(pkgDir, 'types');
        if (fs.existsSync(typesDir)) {
          const dtsPath = path.resolve(pkgDir, pkg.types);
          const existing = await fs.readFile(dtsPath, 'utf-8');
          const typeFiles = await fs.readdir(typesDir);
          const toAdd = await Promise.all(
            typeFiles.map((file) => {
              return fs.readFile(path.resolve(typesDir, file), 'utf-8');
            })
          );
          await fs.writeFile(dtsPath, existing + '\n' + toAdd.join('\n'));
        }
        console.log(
          chalk.bold(chalk.green(`API Extractor completed successfully.`))
        );
      } else {
        console.error(
          `API Extractor completed with ${extractorResult.errorCount} errors` +
            ` and ${extractorResult.warningCount} warnings`
        );
        process.exitCode = 1;
      }
      await fs.remove(`${pkgDir}/dist/packages`);
    }
  };
};

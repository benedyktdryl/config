const shell = require("shelljs");
const tsconfig = require("../tsconfig.json").compilerOptions;

/**
 * Transform `tsconfig.json` compilerOptions into CLI options
 */
const options = Object.keys(tsconfig).reduce((memo, option) => {
  const value = tsconfig[option];

  return `${memo} --${option} ${
    Array.isArray(value) ? value.join(",") : value
  }`;
}, "");

module.exports = {
  /**
   * Which options we should detect and pass to script
   */
  allowedOptions: ["w"],

  /**
   * We expect to run particular shell script and call passed callback in return
   */
  exec: (packagePath, userOptions, callback) => {
    shell.exec(
      `tsc ${packagePath}/index.ts --outDir ${packagePath}/dist ${options} ${userOptions}`,
      callback
    );
  }
};

const fs = require("fs");
const shell = require("shelljs");

module.exports = {
  /**
   * Which options we should detect and pass to script
   */
  allowedOptions: ["watch"],

  /**
   * We expect to run particular shell script and call passed callback in return
   */
  exec: (packagePath, userOptions, callback) => {
    const testPath = `./${packagePath}/spec/spec.js`;

    !fs.existsSync(testPath)
      ? callback(0)
      : shell.exec(`jest ${testPath} ${userOptions}`, callback);
  }
};

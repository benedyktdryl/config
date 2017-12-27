/**
 * This is very basic script for building, that is why it doesn't
 * need to be overengeenered with Babel/Typescript, so
 * only Node.js v4 allowed ES6 parts are used.
 *
 * It's possible to use 70% of this script to automate
 * tasks like tests and linting. Perhaps it can be separate NPM module.
 */

const glob = require("glob");
const argv = require("yargs").argv;
const chalk = require("chalk");
const shell = require("shelljs");
const Table = require("cli-table2");

const tsconfig = require("../tsconfig.json").compilerOptions;

const ALLOWED_USER_OPTIONS = ["w"];

/**
 * Grab all packages, we can implement some exclusions later
 * through CLI args
 */
const paths = glob.sync("packages/*");

/**
 * Transform `tsconfig.json` compilerOptions into CLI options
 */
const options = Object.keys(tsconfig).reduce((memo, option) => {
  const value = tsconfig[option];

  return `${memo} --${option} ${
    Array.isArray(value) ? value.join(",") : value
  }`;
}, "");

const userOptions = Object.keys(argv)
  .filter(key => ALLOWED_USER_OPTIONS.indexOf(key) !== -1)
  .reduce((memo, key) => {
    const prefix = key.length === 1 ? "-" : "--";
    const value = argv[key];

    return `${memo} ${prefix}${key} ${value}`;
  }, "")
  .trim();

/**
 * Trigger `tsc` build for every package and grab results
 * to show in report table
 */
const execs = Promise.all(
  paths.map(packagePath => {
    return new Promise((resolve, reject) => {
      const packageName = chalk.white(packagePath.split("/").pop());

      shell.exec(
        `tsc ${packagePath}/index.ts --outDir ${packagePath}/dist ${options} ${userOptions}`,
        (code, stdout, stderr) => {
          resolve([
            packageName,
            chalk[code === 0 ? "green" : "red"](`${code === 0 ? "✔" : "✘"}`)
          ]);
        }
      );
    });
  })
);

/**
 * Show readable table of build status for all packages
 */
execs.then(items => {
  const table = new Table({
    head: [chalk.yellow.bold("package"), chalk.yellow.bold("status")]
  });

  items.forEach(item => table.push(item));

  console.log(table.toString());
});

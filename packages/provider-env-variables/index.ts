import { resolve as pathResolve } from "path";
import { readFile } from "fs-extra";

import * as glob from "glob";
import * as set from "lodash.set";
import * as merge from "lodash.merge";

export class ProviderEnvVariables {
  private props;

  private static settingsDefault = {
    configName: "custom-environment-variables",
    variables: null
  };

  private variablesMap: {
    [key: string]: string;
  };

  private settings: {
    configName: string;
    variables: { [key: string]: string } | null;
  };

  private cast(value) {
    if (!isNaN(value)) {
      return +value;
    }

    // if it looks stupid but it works, it's ok
    if (value === "false" || value === "true") {
      return value === "false" ? false : true;
    }

    return value;
  }

  private handleFile = async name => {
    const format = name.split(".").pop();
    const fullPath = pathResolve(this.props.cwd, name);

    return this.props.handlers[format].get(await readFile(fullPath));
  };

  private getVariablesMap() {
    const { cwd, formats } = this.props;
    const { configName } = this.settings;

    const globPattern = `${this.settings.configName}.@(${formats.join("|")})`;

    return new Promise((resolve, reject) => {
      glob(globPattern, { cwd }, async (error, paths) => {
        if (error) {
          reject(error);
        }

        resolve(merge(...(await Promise.all(paths.map(this.handleFile)))));
      });
    });
  }

  public injectProps(props) {
    this.props = props;
  }

  public constructor(settings = {}) {
    this.settings = merge(ProviderEnvVariables.settingsDefault, settings);
  }

  public async get() {
    const { env } = process;
    const { variables } = this.settings;
    const variablesMap = variables || (await this.getVariablesMap());

    const config = Object.entries(variablesMap).reduce(
      (partialConfig, [name, path]) => {
        const value = env[name];

        if (value) {
          return set({ ...partialConfig }, path, this.cast(value));
        }

        /**
         * @todo: let's pass it through some logger later so I can conditionally turn it off
         */
        console.warn(`WARNING: Variable ${name} is not present`);

        return partialConfig;
      },
      {}
    );

    return config;
  }
}

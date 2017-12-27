import { argv } from "yargs";
import { hostname } from "os";
import { resolve as pathResolve } from "path";
import { readFile } from "fs-extra";

import * as glob from "glob";
import * as merge from "lodash.merge";

enum LocalNames {
  Deployment = "deployment",
  ShortHostname = "shortHostname",
  FullHostname = "fullHostname",
  Instance = "instance"
}

export class ProviderEnvFiles {
  private props;

  /**
   * List of local names to gather
   */
  private static localNamesList = [
    LocalNames.Deployment,
    LocalNames.ShortHostname,
    LocalNames.FullHostname,
    LocalNames.Instance
  ];

  /**
   * Local names which are gathered from environment / host props
   */
  private localNames: { [key in LocalNames]: string | boolean } = {
    [LocalNames.Deployment]: false,
    [LocalNames.ShortHostname]: false,
    [LocalNames.FullHostname]: false,
    [LocalNames.Instance]: false
  };

  /**
   * Set of filenames in which we should seek for config values
   */
  private fileNames: string[];

  public injectProps(props) {
    this.props = props;

    this.setLocalNames();
    this.setFilenames();
  }

  public get() {
    return new Promise((resolve, reject) => {
      const { cwd } = this.props;
      const globPattern = `@(${this.fileNames.join("|")})`;

      glob(globPattern, { cwd }, async (error, paths) => {
        if (error) {
          reject(error);
        }

        resolve(merge(...(await Promise.all(paths.map(this.handleFile)))));
      });
    });
  }

  private handleFile = async name => {
    const format = name.split(".").pop();
    const fullPath = pathResolve(this.props.cwd, name);

    return this.props.handlers[format].get(await readFile(fullPath));
  };

  private setLocalNames() {
    this.localNames = ProviderEnvFiles.localNamesList.reduce((memo, name) => {
      memo[name] = this[name];

      return memo;
    }, this.localNames);
  }

  /**
   * (deployment) is the deployment type, found in the $NODE_ENV environment
   * variable (which can be overriden by using $NODE_CONFIG_ENV
   * environment variable). Defaults to 'development'.
   */
  private get deployment() {
    const { NODE_ENV, NODE_CONFIG_ENV } = process.env;

    return !!NODE_CONFIG_ENV ? process.env[NODE_CONFIG_ENV] : NODE_ENV;
  }

  /**
   * hostname is the $HOST environment variable (or --HOST command line parameter)
   * if set, otherwise the $HOSTNAME environment variable (or --HOSTNAME command
   * line parameter) if set, otherwise the hostname found from require('os').hostname().
   */
  private get hostname() {
    const { HOST: HOST_ENV, HOSTNAME: HOSTNAME_ENV } = process.env;
    const { HOST: HOST_ARG, HOSTNAME: HOSTNAME_ARG } = argv;

    return (
      HOST_ENV ||
      HOST_ARG ||
      HOSTNAME_ENV ||
      HOSTNAME_ARG ||
      hostname() ||
      false
    );
  }

  private get shortHostname() {
    return this.hostname.split(".").shift();
  }

  private get fullHostname() {
    return this.hostname !== this.shortHostname ? this.hostname : false;
  }

  /**
   * If the $NODE_APP_INSTANCE environment variable (or --NODE_APP_INSTANCE
   * command line parameter) is set, then files with this appendage will be loaded.
   * See the Multiple Application Instances section of the main documentaion page
   * for more information.
   */
  private get instance() {
    const { NODE_APP_INSTANCE: NODE_APP_INSTANCE_ENV } = process.env;
    const { NODE_APP_INSTANCE: NODE_APP_INSTANCE_ARG } = argv;

    return NODE_APP_INSTANCE_ENV || NODE_APP_INSTANCE_ARG || false;
  }

  private getFilesNames(extension) {
    const {
      instance,
      deployment,
      shortHostname,
      fullHostname
    } = this.localNames;

    const fileNames = [];

    fileNames.push(`default.${extension}`);

    if (instance) {
      fileNames.push(`default-${instance}.${extension}`);
    }

    if (deployment) {
      fileNames.push(`${deployment}.${extension}`);
    }

    if (deployment && instance) {
      fileNames.push(`${deployment}-${instance}.${extension}`);
    }

    if (shortHostname) {
      fileNames.push(`${shortHostname}.${extension}`);
    }

    if (shortHostname && instance) {
      fileNames.push(`${shortHostname}-${instance}.${extension}`);
    }

    if (shortHostname && deployment) {
      fileNames.push(`${shortHostname}-${deployment}.${extension}`);
    }

    if (shortHostname && deployment && instance) {
      fileNames.push(`${shortHostname}-${deployment}-${instance}.${extension}`);
    }

    if (fullHostname) {
      fileNames.push(`${fullHostname}.${extension}`);
    }

    if (fullHostname && instance) {
      fileNames.push(`${fullHostname}-${instance}.${extension}`);
    }

    if (fullHostname && deployment) {
      fileNames.push(`${fullHostname}-${deployment}.${extension}`);
    }

    if (fullHostname && deployment && instance) {
      fileNames.push(`${fullHostname}-${deployment}-${instance}.${extension}`);
    }

    fileNames.push(`local.${extension}`);

    if (instance) {
      fileNames.push(`local-${instance}.${extension}`);
    }

    if (deployment) {
      fileNames.push(`local-${deployment}.${extension}`);
    }

    if (deployment && instance) {
      fileNames.push(`local-${deployment}-${instance}.${extension}`);
    }

    return fileNames;
  }

  private setFilenames() {
    this.fileNames = this.props.formats.reduce(
      (memo, format) => [...memo, ...this.getFilesNames(format)],
      []
    );
  }
}

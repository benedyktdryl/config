import { cwd as processCwd } from "process";
import { resolve as pathResolve } from "path";
import * as get from "lodash.get";
import * as merge from "lodash.merge";

export interface Handler {
  get(): object;
}

export type Hook = (config: object) => object;

export interface ProviderProps {
  cwd: string;
  formats: string[];
  handlers: { [key: string]: Handler };
}

/**
 * Core `Config` class concept
 */
export class Config {
  /**
   * Array of injected providers which will provide data
   * to compose our config from
   */
  private providers;

  /**
   * Store root object of composed config
   */
  private config;

  /**
   * Store callbacks which will process composed config
   */
  private hooks: Hook[];

  /**
   * Props to be injected into every provider
   */
  private providerProps: ProviderProps = {
    cwd: "",
    formats: [],
    handlers: {}
  };

  /**
   * Wrap in resolved promise if value is not wrapped already
   */
  private toPromise = value => (value.then ? value : Promise.resolve(value));

  private applyHook = async (config, hook) =>
    await this.toPromise(hook(config));

  /**
   * Handlers need to be accessed by formats they are handling
   * therefore use `format` property as a key
   */
  private getHandlersMap(handlers) {
    return handlers.reduce((handlersMap, handler) => {
      handlersMap[handler.constructor.format] = handler;

      return handlersMap;
    }, {});
  }

  private setProviderProps({ handlers: handlersArray, basePath }) {
    const handlers = this.getHandlersMap(handlersArray);
    const formats = Object.keys(handlers);
    const cwd = pathResolve(processCwd(), basePath);

    this.providerProps = { cwd, handlers, formats };
  }

  public constructor({ handlers, providers, hooks, basePath }) {
    this.hooks = hooks;
    this.providers = providers;

    this.setProviderProps({ basePath, handlers });
  }

  public async init() {
    const providedValues = await Promise.all(
      this.providers.map(provider => {
        provider.injectProps(this.providerProps);

        return provider.get();
      })
    );

    this.config = await this.hooks.reduce(
      this.applyHook,
      providedValues.reduce(merge, {})
    );
  }

  public get(path) {
    return get(this.config, path);
  }
}

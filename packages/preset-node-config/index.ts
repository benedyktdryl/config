import { inspect } from "util";

import { Config } from "@config/config";

import { ProviderEnvFiles } from "@config/provider-env-files";
import { ProviderEnvVariables } from "@config/provider-env-variables";

import { HandlerJS } from "@config/handler-js";
import { HandlerJSON } from "@config/handler-json";
import { HandlerYaml } from "@config/handler-yaml";
import { HandlerTS } from "@config/handler-ts";

/**
 * Bare metal usage example
 */
const providerEnvFiles = new ProviderEnvFiles();
const providerEnvVariables = new ProviderEnvVariables();

const handlerJS = new HandlerJS({});
const handlerJSON = new HandlerJSON();
const handlerYaml = new HandlerYaml();
const handlerTS = new HandlerTS();

const basePath = "config";
const handlers = [handlerJSON, handlerJS, handlerYaml, handlerTS];
const providers = [providerEnvFiles, providerEnvVariables];

(async () => {
  try {
    const config = new Config({ handlers, providers, basePath });
    // await, as it's asynchronous
    await config.init();

    console.log(
      inspect(config.get("database.couchdb"), {
        showHidden: false,
        depth: null
      }),

      inspect(config.get("superUser"), {
        showHidden: false,
        depth: null
      }),

      inspect(config.get("presentTS"), {
        showHidden: false,
        depth: null
      })
    );
  } catch (error) {
    console.error(error);
  }
})();

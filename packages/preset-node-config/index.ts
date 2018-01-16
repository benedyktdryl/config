import { inspect } from "util";

import { Config } from "@config/config";

import { ProviderEnvFiles } from "@config/provider-env-files";
import { ProviderEnvVariables } from "@config/provider-env-variables";

import { HandlerJSON } from "@config/handler-json";
import { HandlerYAML } from "@config/handler-yaml";

import { postDeferred } from "@config/post-deferred";
import { postJoiValidate, Joi } from "@config/post-joi-validate";

/**
 * Bare metal usage example
 */
const providerEnvFiles = new ProviderEnvFiles();
const providerEnvVariables = new ProviderEnvVariables();

const handlerJSON = new HandlerJSON();
const handlerYAML = new HandlerYAML();

const basePath = "config";
const handlers = [handlerJSON, handlerYAML];
const providers = [providerEnvFiles, providerEnvVariables];

const hooks = [
  postDeferred({
    "database.couchdb.connections[0].password": password => `${password} 😊`
  }),
  postJoiValidate(
    Joi.object().keys({
      keyToThrow: Joi.string().required()
    })
  )
];

(async () => {
  try {
    const config = new Config({ handlers, providers, hooks, basePath });
    // await, as it's asynchronous
    await config.init();

    console.log(
      inspect(config.get("database.couchdb"), {
        showHidden: false,
        depth: null
      })
    );
  } catch (error) {
    console.error(error);
  }
})();

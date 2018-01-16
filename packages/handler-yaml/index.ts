import * as yaml from "js-yaml";

export class HandlerYAML {
  public static format: Readonly<string> = "yaml";

  public get(content) {
    try {
      return Promise.resolve(yaml.safeLoad(content));
    } catch (error) {
      return Promise.reject({});
    }
  }
}

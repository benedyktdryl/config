import * as yaml from "js-yaml";

export class HandlerYaml {
  public static format: Readonly<string> = "yml";

  public get(content) {
    try {
      return Promise.resolve(yaml.safeLoad(content));
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

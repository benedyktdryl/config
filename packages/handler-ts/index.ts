import * as merge from "lodash.merge";
import { transform } from "@babel/core";

export class HandlerTS {
  public static format: Readonly<string> = "ts";
  private static configDefault = {
    /* @todo: pass custom preset-env configuration later */
    presets: ["@babel/preset-env", "@babel/preset-typescript"]
  };

  private config: { [key: string]: any };

  public constructor(config = {}) {
    this.config = merge(HandlerTS.configDefault, config);
  }

  public get(content) {
    return new Promise((resolve, reject) => {
      transform(content.toString(), this.config, (error, result) => {
        if (error) {
          return reject(error);
        }

        return resolve(eval(result.code));
      });
    });
  }
}

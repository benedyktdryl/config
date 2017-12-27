import * as merge from "lodash.merge";
import { transform } from "@babel/core";

export class HandlerJS {
  public static format: Readonly<string> = "js";
  private static configDefault = { presets: ["@babel/preset-es2015"] };

  private config: { [key: string]: any };

  public constructor(config = {}) {
    this.config = merge(HandlerJS.configDefault, config);
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

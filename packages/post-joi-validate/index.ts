import * as joi from "joi";

export const Joi = joi;

export const postJoiValidate = schema => config => {
  const result = joi.validate(config, schema);

  if (result.error === null) {
    return config;
  }

  throw result.error.toString();
};

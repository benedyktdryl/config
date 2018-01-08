import * as set from "lodash.set";
import * as get from "lodash.get";

export const postDeferred = deferredsMap => config =>
  Object.entries(deferredsMap).reduce(
    (memoConfig, [path, callback]) =>
      set(memoConfig, path, callback(get(memoConfig, path))),
    config
  );

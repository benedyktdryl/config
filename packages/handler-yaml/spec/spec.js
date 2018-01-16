/**
 * Writting tests in JS instead of TS until sourcemap handling will be fixed
 */
const fs = require("fs");
const path = require("path");
const { HandlerYAML } = require("../dist");

describe("HandlerYAML", () => {
  test("Should handle valid YAML", () => {
    const validYAML = fs
      .readFileSync(path.resolve(__dirname, "fixture-valid.yml"))
      .toString();

    const handler = new HandlerYAML();

    handler.get(validYAML).then(content => {
      expect(content).toEqual({ foo: "bar" });
    });
  });

  test("Should handle valid YAML", () => {
    const invalidYAML = fs
      .readFileSync(path.resolve(__dirname, "fixture-invalid.yml"))
      .toString();

    const handler = new HandlerYAML();

    handler.get(invalidYAML).then(content => {
      expect(content).toEqual({});
    });
  });
});

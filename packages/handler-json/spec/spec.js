/**
 * Writting tests in JS instead of TS until sourcemap handling will be fixed
 */
const { HandlerJSON } = require("../dist");

describe("HandlerJSON", () => {
  test("Should handle valid JSON", () => {
    const validJSON = '{ "foo": "bar" }';
    const handler = new HandlerJSON();

    handler.get(validJSON).then(content => {
      expect(content).toEqual({ foo: "bar" });
    });
  });

  test("Should handle invalid JSON", () => {
    const invalidJSON = "foo";
    const handler = new HandlerJSON();

    handler.get(invalidJSON).then(content => {
      expect(content).toEqual({});
    });
  });
});

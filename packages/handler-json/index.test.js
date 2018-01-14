/**
 * Writting tests in JS instead of TS until sourcemap handling will be fixed
 */

const { HandlerJSON } = require("./dist");

describe("HandlerJSON", () => {
  test("Handling valid JSON", () => {
    const validJSON = '{ "foo": "bar" }';
    const handler = new HandlerJSON();

    expect(handler.get(validJSON)).toEqual({ foo: "bar" });
  });
});

export class HandlerJSON {
  public static format: Readonly<string> = "json";

  public get(content) {
    try {
      const parsedContent = JSON.parse(content.toString());

      // https://stackoverflow.com/a/20392392
      if (parsedContent && typeof parsedContent === "object") {
        return parsedContent;
      }
    } catch (e) {
      return {};
    }

    return {};
  }
}

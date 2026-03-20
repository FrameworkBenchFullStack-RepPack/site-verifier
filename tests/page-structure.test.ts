import { By, logging, type WebDriver } from "selenium-webdriver";
import { expect, beforeAll, afterAll, it, describe } from "vitest";
import { getDriver } from "../lib/driver";
import { PageLayout, pages } from "../lib/pages";

let driver: WebDriver;

for (const [name, meta] of Object.entries(pages)) {
  describe(`Page structure tests: ${name}`, () => {
    beforeAll(async () => {
      driver = await getDriver(meta.url);
    });

    afterAll(async () => {
      driver.quit();
    });

    it("Is in standards mode", async () => {
      const compatMode: string = await driver.executeScript(
        "return document.compatMode;",
      );
      expect(compatMode, "Page is in standards mode").toBe("CSS1Compat");
    });
    it("Has a lang attribute", async () => {
      const html = await driver.findElement(By.css("html"));
      const lang = await html.getAttribute("lang");
      expect(lang, "Has english lang attribute").toBe("en");
    });
    it("Has meta elements", async () => {
      const charsetMetas = await driver.findElements(
        By.css(`meta[charset="utf-8"]`),
      );
      expect(charsetMetas[0], "Has a charset meta element").toBeTruthy();

      const viewportMetas = await driver.findElements(
        By.css(
          `meta[name="viewport"][content="width=device-width, initial-scale=1"]`,
        ),
      );
      expect(viewportMetas[0], "Has a viewport meta element").toBeTruthy();

      const metas = await driver.findElements(By.css("meta"));
      expect(metas.length, "Has only those two meta elements").toBe(2);
    });
    it("Has an icon", async () => {
      const iconLinks = await driver.findElements(
        By.css(`link[rel="icon"][type="image/svg+xml"][href]`),
      );
      expect(iconLinks.length, "There is an icon link element").toBe(1);
      const href = await iconLinks[0].getAttribute("href");
      expect(href, "Icon uses SVG extension").toMatch(/\.svg$/v);
    });
    it("Has a title", async () => {
      const titles = await driver.findElements(By.css("title"));
      expect(titles.length, "There is a title element").toBe(1);
      const title = await driver.getTitle();
      expect(title, "Document title is correctly read").toBe("Test site");
    });
    it("Has a header", async () => {
      const headers = await driver.findElements(By.css("header"));
      expect(headers.length, "There is a header element").toBe(1);
      //TODO
    });
    it("Has a footer", async () => {
      const footers = await driver.findElements(By.css("footer"));
      expect(footers.length, "There is a footer element").toBe(1);
      //TODO
    });
    it("Has a heading", async () => {
      const headings = await driver.findElements(By.css("h1"));
      expect(headings.length, "There is a heading element").toBe(1);
      const heading = headings[0];
      const text = await heading.getText();
      expect(text, "Heading is correct").toBe(meta.heading);
    });
    it("Has text content", async () => {
      const blocks = await driver.findElements(
        meta.layout === PageLayout.Home
          ? By.css("body > main > div > p")
          : By.css("body > main > p"),
      );
      expect(blocks.length, "Found the expected number of text blocks").toBe(
        meta.bodyBlocks,
      );
      const blockStart = await blocks[0].getText();
      const blockEnd = await blocks.at(-1)?.getText();
      expect(blockStart, "Text start is correct").toContain(meta.bodyStart);
      expect(blockEnd, "Text end is correct").toContain(meta.bodyEnd);
    });
    it("Does not log to console", async () => {
      const logs = await driver.manage().logs().get(logging.Type.BROWSER);
      expect(logs.length, "No logs were collected").toBe(0);
    });
  });
}

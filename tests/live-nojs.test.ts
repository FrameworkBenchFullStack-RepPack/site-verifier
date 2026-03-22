import { By, type WebDriver } from "selenium-webdriver";
import { expect, beforeAll, afterAll, it, describe } from "vitest";
import { getDriver } from "../lib/driver";
import { pages } from "../lib/pages";

let driver: WebDriver;

for (const page of [pages.live, pages.home]) {
  describe(`Live component with JS disabled: ${page.url.pathname}`, () => {
    beforeAll(async () => {
      driver = await getDriver(page.url, { js: false });
    });

    afterAll(async () => {
      driver.quit();
    });

    it("Has #live-data table", async () => {
      const lives = await driver.findElements(By.css("#live-data"));
      expect(lives.length, "Id is only used once").toBe(1);
      const liveElement = lives[0];
      const tagName = await liveElement.getTagName();
      expect(tagName, "Element is a table").toBe("table");
    });
    it("Has table cells", async () => {
      const cells = await driver.findElements(
        By.css("#live-data > tbody > tr > td"),
      );
      expect(cells.length, "Table has three cells").toBe(3);
      for (const [index, cell] of cells.entries()) {
        const text = await cell.getText();
        expect(text, `Cell ${index} is empty`).toBe("");
      }
    });
  });
}

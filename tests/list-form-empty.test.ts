import { By, Key, logging, WebDriver } from "selenium-webdriver";
import { beforeAll, afterAll, it, describe, expect } from "vitest";
import { getDriver } from "../lib/driver";
import { listConfigs } from "../lib/list";
import { sleep } from "../lib/sleep";

let driver: WebDriver;

for (const config of listConfigs) {
  describe(`List component can handle empty inputs: ${config.page.url.pathname}${config.js ? "" : " (js disabled)"}`, () => {
    beforeAll(async () => {
      driver = await getDriver(config.page.url, { js: config.js });
    });

    afterAll(async () => {
      driver.quit();
    });

    it("Can handle empty inputs", async () => {
      const names = ["age_from", "age_to", "size", "page"];

      const deleteKeys = [
        Key.ARROW_RIGHT,
        Key.ARROW_RIGHT,
        Key.ARROW_RIGHT,
        Key.BACK_SPACE,
        Key.BACK_SPACE,
        Key.BACK_SPACE,
      ];

      for (const name of names) {
        await driver.findElement(By.css(`#list input[name="${name}"]`)).click();
        await driver
          .actions()
          .sendKeys(...deleteKeys)
          .perform();
      }

      await sleep(2000);

      for (const name of names) {
        const value = await driver
          .findElement(By.css(`#list input[name="${name}"]`))
          .getAttribute("value");
        expect(value, "Input value is empty").toBe("");
      }
    });
    it("Does not log to console", async () => {
      const logs = await driver.manage().logs().get(logging.Type.BROWSER);
      expect(logs.length, "No logs were collected").toBe(0);
    });
  });
}

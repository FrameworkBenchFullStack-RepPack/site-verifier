import { By, type WebDriver } from "selenium-webdriver";
import { expect, beforeAll, afterAll, it, describe } from "vitest";
import { getDriver } from "../lib/driver";
import { pages } from "../lib/pages";
import liveData from "../data/liveData.json" with { type: "json" };
import { sleep } from "../lib/sleep";

let driver: WebDriver;

function getIndexData(index: number): [string, string, string] {
  return liveData[index].map((num) => String(num)) as [string, string, string];
}

for (const page of [pages.live, pages.home]) {
  describe(`Live component data flow: ${page.url.pathname}`, () => {
    beforeAll(async () => {
      driver = await getDriver(page.url, {
        waitForElement: By.id("live-data"),
      });
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
    it("Updates table cells with correct values", async () => {
      let initialCellText: string;
      await driver.wait(
        async () => {
          initialCellText = await (
            await driver.findElement(
              By.css("#live-data > tbody > tr > td:first-of-type"),
            )
          ).getText();
          return Boolean(initialCellText);
        },
        2000,
        "Live data is populated",
        100,
      );

      let dataIndex = liveData.findIndex(
        (data) => String(data[0]) === initialCellText,
      );
      expect(
        dataIndex,
        "Initially populated data is in live data list",
      ).not.toBe(-1);
      let lastUpdate = Date.now();
      let fails = 0;
      while (dataIndex < liveData.length - 1) {
        await sleep(100);
        expect(
          Date.now() - lastUpdate,
          "Updates do not take much more than a second",
        ).toBeLessThan(1300);
        const cells = await driver.findElements(
          By.css("#live-data > tbody > tr > td"),
        );
        expect(cells.length, "Table has three cells").toBe(3);

        const currentData = getIndexData(dataIndex);
        const nextData = getIndexData(dataIndex + 1);
        let matches = true;
        let nextMatches = true;
        const textPromises = cells.map((cell) => cell.getText());
        for (const [cellIndex, textPromise] of textPromises.entries()) {
          const text = await textPromise;
          if (text !== currentData[cellIndex]) {
            matches = false;
          }
          if (text !== nextData[cellIndex]) {
            nextMatches = false;
          }
        }
        if (!(matches || nextMatches) && fails < 2) {
          fails++;
          continue;
        }
        expect(
          matches || nextMatches,
          "Cell data is correct for current time slot",
        ).toBeTruthy();
        if (matches) {
          fails = 0;
          continue;
        }
        if (nextMatches) {
          const now = Date.now();
          expect(
            now - lastUpdate,
            "Updates do not take much less than one second",
          ).toBeGreaterThan(500);
          lastUpdate = Date.now();
          dataIndex++;
          fails = 0;
        }
      }
    });
  });
}

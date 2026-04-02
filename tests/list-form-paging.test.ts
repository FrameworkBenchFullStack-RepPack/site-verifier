import { By, Key, WebDriver } from "selenium-webdriver";
import { beforeAll, afterAll, it, describe } from "vitest";
import { getDriver } from "../lib/driver";
import {
  compareTableRows,
  getTableRows,
  ListConfig,
  listConfigs,
} from "../lib/list";
import { db } from "../data/database";
import { category, person } from "../drizzle/schema";
import { asc, eq } from "drizzle-orm";
import { sendKeys } from "../lib/input";

let driver: WebDriver;
function tableFinder() {
  return driver.findElement(By.css("#list-data table"));
}

async function setPaging(
  config: ListConfig,
  name: "size" | "page",
  value: number,
): Promise<void> {
  await driver.findElement(By.css(`input[name="${name}"]`)).click();
  await sendKeys(driver, [
    Key.ARROW_RIGHT,
    Key.ARROW_RIGHT,
    Key.ARROW_RIGHT,
    Key.BACK_SPACE,
    Key.BACK_SPACE,
    Key.BACK_SPACE,
    ...String(value),
  ]);

  if (config.js === false) {
    await driver.findElement(By.css(`#list form button`)).click();
  }
}

function setSize(config: ListConfig, value: number): Promise<void> {
  return setPaging(config, "size", value);
}

function setPage(config: ListConfig, value: number): Promise<void> {
  return setPaging(config, "page", value);
}

for (const config of listConfigs) {
  describe(`List component form input: ${config.page.url.pathname}${config.js ? "" : " (js disabled)"}`, () => {
    beforeAll(async () => {
      driver = await getDriver(config.page.url, { js: config.js });
    });

    afterAll(async () => {
      driver.quit();
    });

    it("Has paging", async () => {
      await setSize(config, 1);
      await driver.wait(
        async () => {
          return (await getTableRows(tableFinder)).length === 1;
        },
        2500,
        "Only a single person is shown",
        100,
      );

      await setSize(config, 255);
      await driver.wait(
        async () => {
          return (await getTableRows(tableFinder)).length === 255;
        },
        2500,
        "Exactly 255 persons are shown",
        100,
      );

      const dbRows83_1 = await db
        .select()
        .from(person)
        .leftJoin(category, eq(person.categoryId, category.id))
        .orderBy(asc(person.name))
        .limit(83);

      await setSize(config, 83);
      await driver.wait(
        async () => {
          const pageRows = await getTableRows(tableFinder);
          return compareTableRows(pageRows, dbRows83_1);
        },
        2500,
        "The first page with exactly 83 people are shown",
        100,
      );

      const dbRows83_2 = await db
        .select()
        .from(person)
        .leftJoin(category, eq(person.categoryId, category.id))
        .orderBy(asc(person.name))
        .limit(83)
        .offset(83);

      await setPage(config, 2);
      await driver.wait(
        async () => {
          const pageRows = await getTableRows(tableFinder);
          return compareTableRows(pageRows, dbRows83_2);
        },
        2500,
        "The second page with exactly 83 people are shown",
        100,
      );

      const dbRows83_92 = await db
        .select()
        .from(person)
        .leftJoin(category, eq(person.categoryId, category.id))
        .orderBy(asc(person.name))
        .limit(83)
        .offset(83 * 91);

      await setPage(config, 92);
      await driver.wait(
        async () => {
          const pageRows = await getTableRows(tableFinder);
          return compareTableRows(pageRows, dbRows83_92);
        },
        2500,
        "The 92nd page with exactly 83 people are shown",
        100,
      );

      await setPage(config, 122);
      await driver.wait(
        async () => {
          return (
            (await getTableRows(tableFinder)).length === 0 &&
            (await driver.findElements(By.css("#list-data .no-data-message")))
              .length === 1
          );
        },
        2500,
        "The 122nd page, which is empty, is shown",
        100,
      );
    });
  });
}

import { By, WebDriver } from "selenium-webdriver";
import { Select } from "selenium-webdriver/lib/select";
import { beforeAll, afterAll, it, describe, expect } from "vitest";
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

let driver: WebDriver;
function tableFinder() {
  return driver.findElement(By.css("#list-data table"));
}

async function setSort(
  config: ListConfig,
  value: "name" | "age" | "category",
): Promise<void> {
  const selectElement = await driver.findElement(
    By.css(`#list form select[name="sort"]`),
  );
  const select = new Select(selectElement);
  await select.selectByValue(value);

  if (config.js === false) {
    await driver
      .findElement(By.css(`#list form :is(button, input[type="submit"])`))
      .click();
  }
}

for (const config of listConfigs) {
  describe(`List component form input: ${config.page.url.pathname}${config.js ? "" : " (js disabled)"}`, () => {
    beforeAll(async () => {
      driver = await getDriver(config.page.url, {
        js: config.js,
        waitForElement: By.id("list"),
      });
    });

    afterAll(async () => {
      await driver.quit();
    });

    it("Can sort", async () => {
      const dbRowsAge = await db
        .select()
        .from(person)
        .leftJoin(category, eq(person.categoryId, category.id))
        .orderBy(asc(person.age), asc(person.name))
        .limit(100);

      await setSort(config, "age");
      await driver.wait(
        async () => {
          const pageRows = await getTableRows(tableFinder);
          return compareTableRows(pageRows, dbRowsAge);
        },
        2500,
        "People are sorted by ascending age",
        100,
      );

      const urlAge = new URL(await driver.getCurrentUrl());
      expect(
        urlAge.searchParams.get("sort"),
        "Seacrh param for sort is set",
      ).toBe("age");

      const dbRowsCategory = await db
        .select()
        .from(person)
        .leftJoin(category, eq(person.categoryId, category.id))
        .orderBy(asc(category.name), asc(person.name))
        .limit(100);

      await setSort(config, "category");
      await driver.wait(
        async () => {
          const pageRows = await getTableRows(tableFinder);
          return compareTableRows(pageRows, dbRowsCategory);
        },
        2500,
        "People are sorted by ascending category name",
        100,
      );

      const urlCategory = new URL(await driver.getCurrentUrl());
      expect(
        urlCategory.searchParams.get("sort"),
        "Seacrh param for sort is set",
      ).toBe("category");
    });
  });
}

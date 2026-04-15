import { By, type WebDriver } from "selenium-webdriver";
import { expect, beforeAll, afterAll, it, describe } from "vitest";
import { getDriver } from "../lib/driver";
import { listConfigs } from "../lib/list";
import { pages } from "../lib/pages";

let driver: WebDriver;

for (const config of listConfigs) {
  describe(`List component structure: ${config.page.url.pathname}${config.js ? "" : " (js disabled)"}`, () => {
    beforeAll(async () => {
      driver = await getDriver(config.page.url, {
        js: config.js,
        waitForElement: By.id("list"),
      });
    });

    afterAll(async () => {
      await driver.quit();
    });

    it("Has #list div", async () => {
      const list = await driver.findElements(By.css("#list"));
      expect(list.length, "Id is only used once").toBe(1);
      const listElement = list[0];
      const tagName = await listElement.getTagName();
      expect(tagName, "Element is a div").toBe("div");
    });

    it("Has controls", async () => {
      const controls = await driver.findElements(By.css("#list > .controls"));
      expect(controls.length, "List has controls").toBe(1);
      const controlsElement = controls[0];

      const sortElements = await controlsElement.findElements(
        By.css(`select[name="sort"]`),
      );
      expect(sortElements.length, "Has sort control").toBe(1);
      const sortElement = sortElements[0];
      const sortValue = await sortElement.getAttribute("value");
      expect(sortValue, `Default sort value is "name"`).toBe("name");

      const sortOptions = await sortElement.findElements(By.css("option"));
      expect(sortOptions.length, "Has three sort options").toBe(3);
      const sortOptionName = await sortElement.findElements(
        By.css(`option[value="name"]:nth-of-type(1)`),
      );
      expect(sortOptionName.length, `First option is "name"`).toBe(1);
      const sortOptionNameText = await sortOptionName[0].getText();
      expect(sortOptionNameText, "Sort option uses correct description").toBe(
        "Name",
      );
      const sortOptionAge = await sortElement.findElements(
        By.css(`option[value="age"]:nth-of-type(2)`),
      );
      expect(sortOptionAge.length, `Second option is "age"`).toBe(1);
      const sortOptionAgeText = await sortOptionAge[0].getText();
      expect(sortOptionAgeText, "Sort option uses correct description").toBe(
        "Age",
      );
      const sortOptionCategory = await sortElement.findElements(
        By.css(`option[value="category"]:nth-of-type(3)`),
      );
      expect(sortOptionCategory.length, `Third option is "category"`).toBe(1);
      const sortOptionCategoryText = await sortOptionCategory[0].getText();
      expect(
        sortOptionCategoryText,
        "Sort option uses correct description",
      ).toBe("Category");

      const ageFromElements = await controlsElement.findElements(
        By.css(`input[type="number"][name="age_from"]`),
      );
      expect(ageFromElements.length, "There is an age from input").toBe(1);
      const ageFromElement = ageFromElements[0];
      const ageFromValue = await ageFromElement.getAttribute("value");
      const ageFromMin = await ageFromElement.getAttribute("min");
      const ageFromMax = await ageFromElement.getAttribute("max");
      const ageFromStep = await ageFromElement.getAttribute("step");
      const ageFromRequired = await ageFromElement.getAttribute("required");
      expect(ageFromValue, "Default age from value is 0").toBe("0");
      expect(ageFromMin, "Age from is limited to min 0").toBe("0");
      expect(ageFromMax, "Age from is limited to max 100").toBe("100");
      expect(ageFromStep, "Age from is stepped as integer").toBe("1");
      expect(ageFromRequired, "Age from input is required").toBe("true");

      const ageToElements = await controlsElement.findElements(
        By.css(`input[type="number"][name="age_to"]`),
      );
      expect(ageToElements.length, "There is an age to input").toBe(1);
      const ageToElement = ageToElements[0];
      const ageToValue = await ageToElement.getAttribute("value");
      const ageToMin = await ageToElement.getAttribute("min");
      const ageToMax = await ageToElement.getAttribute("max");
      const ageToStep = await ageToElement.getAttribute("step");
      const ageToRequired = await ageToElement.getAttribute("required");
      expect(ageToValue, "Default age to value is 100").toBe("100");
      expect(ageToMin, "Age to is limited to min 0").toBe("0");
      expect(ageToMax, "Age to is limited to max 100").toBe("100");
      expect(ageToStep, "Age to is stepped as integer").toBe("1");
      expect(ageToRequired, "Age to input is required").toBe("true");

      const categories = await controlsElement.findElements(
        By.css(`input[type="checkbox"][name="category"]`),
      );
      expect(categories.length, "Has four categories").toBe(4);

      const categoryDapibus = await controlsElement.findElements(
        By.css(
          `label:nth-of-type(1) > input[type="checkbox"][name="category"][value="4"]`,
        ),
      );
      expect(categoryDapibus.length, `First category is id 4 (Dapibus)`).toBe(
        1,
      );

      const categoryEgestas = await controlsElement.findElements(
        By.css(
          `label:nth-of-type(2) > input[type="checkbox"][name="category"][value="3"]`,
        ),
      );
      expect(categoryEgestas.length, `Second category is id 3 (Egestas)`).toBe(
        1,
      );

      const categoryMetus = await controlsElement.findElements(
        By.css(
          `label:nth-of-type(3) > input[type="checkbox"][name="category"][value="2"]`,
        ),
      );
      expect(categoryMetus.length, `Third category is id 2 (Metus)`).toBe(1);

      const categoryRhoncus = await controlsElement.findElements(
        By.css(
          `label:nth-of-type(4) > input[type="checkbox"][name="category"][value="1"]`,
        ),
      );
      expect(categoryRhoncus.length, `Fourth category is id 1 (Rhoncus)`).toBe(
        1,
      );

      const sizeElements = await controlsElement.findElements(
        By.css(`input[type="number"][name="size"]`),
      );
      expect(sizeElements.length, "There is a size input").toBe(1);
      const sizeElement = sizeElements[0];
      const sizeValue = await sizeElement.getAttribute("value");
      const sizeMin = await sizeElement.getAttribute("min");
      const sizeMax = await sizeElement.getAttribute("max");
      const sizeStep = await sizeElement.getAttribute("step");
      const sizeRequired = await sizeElement.getAttribute("required");
      expect(sizeValue, "Default size value is 100").toBe(
        config.page === pages.home ? "8" : "100",
      );
      expect(sizeMin, "Size is limited to min 1").toBe("1");
      expect(sizeMax, "Size is limited to max 1000").toBe("1000");
      expect(sizeStep, "Size is stepped as integer").toBe("1");
      expect(sizeRequired, "Size input is required").toBe("true");

      const pageElements = await controlsElement.findElements(
        By.css(`input[type="number"][name="page_num"]`),
      );
      expect(pageElements.length, "There is a page input").toBe(1);
      const pageElement = pageElements[0];
      const pageValue = await pageElement.getAttribute("value");
      const pageMin = await pageElement.getAttribute("min");
      const pageMax = await pageElement.getAttribute("max");
      const pageStep = await pageElement.getAttribute("step");
      const pageRequired = await pageElement.getAttribute("required");
      expect(pageValue, "Default page value is 1").toBe("1");
      expect(pageMin, "Page is limited to min 1").toBe("1");
      expect(pageMax, "Page is limited to max 2,000,000").toBe("2000000");
      expect(pageStep, "Page is stepped as integer").toBe("1");
      expect(pageRequired, "Page input is required").toBe("true");

      const buttonElements = await controlsElement.findElements(
        By.css(`button, input[type="submit"]`),
      );
      expect(buttonElements.length, "There is a submit button").toBe(1);
      const buttonElement = buttonElements[0];
      const buttonText =
        (await buttonElement.getAttribute("value")) ||
        (await buttonElement.getText());
      expect(buttonText, "Button has correct text").toBe("Search");
    });

    it("Has data", async () => {
      const dataElements = await driver.findElements(
        By.css("#list > #list-data"),
      );
      expect(dataElements.length, "List has data div").toBe(1);
      const tableElements = await dataElements[0].findElements(
        By.css("table.table"),
      );
      expect(tableElements.length, "Data div has one table").toBe(1);
    });
  });
}

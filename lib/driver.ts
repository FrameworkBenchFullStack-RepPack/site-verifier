import { Builder, By, logging, until, WebDriver } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";

export type DriverOptions = {
  js?: boolean;
  waitForElement?: By;
};

const loggingPrefs = new logging.Preferences();
loggingPrefs.setLevel(logging.Type.BROWSER, logging.Level.ALL);

export async function getDriver(
  url: URL | string | false,
  options?: DriverOptions,
): Promise<WebDriver> {
  let urlString = typeof url === "string" ? url : url.toString();
  let driver: WebDriver;
  try {
    const chromeOptions = new chrome.Options();

    if (options?.js === false) {
      chromeOptions.setUserPreferences({
        "profile.managed_default_content_settings.javascript": 2,
      });
    }

    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(chromeOptions)
      .setLoggingPrefs(loggingPrefs)
      .build();

    if (url !== false) await driver.get(urlString);

    if (options?.waitForElement) {
      const locator = driver.findElement(options.waitForElement);
      await driver.wait(until.elementIsVisible(locator), 5_000);
    }
  } catch (error) {
    await driver!?.quit();
    throw error;
  }
  return driver!;
}

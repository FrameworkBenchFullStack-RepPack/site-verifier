import { Builder, logging, WebDriver } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";

export type DriverOptions = {
  js?: boolean;
};

const loggingPrefs = new logging.Preferences();
loggingPrefs.setLevel(logging.Type.BROWSER, logging.Level.ALL);

export async function getDriver(
  url: URL | string,
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

    await driver.get(urlString);
  } catch (error) {
    await driver!?.quit();
    throw error;
  }
  return driver!;
}

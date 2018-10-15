import { browser } from "protractor";
import { Session } from "../app/models/session";
import { HomePage } from "./pages/home.po";

browser.manage().timeouts().implicitlyWait(10000);
browser.manage().timeouts().pageLoadTimeout(30000);
browser.manage().timeouts().setScriptTimeout(30000);

browser.manage().window().setPosition(0, 0);
browser.manage().window().setSize(1920, 1080);

browser.waitForAngularEnabled(false);

describe("homepage", () => {
    it("should create session", () => {
        const session = new Session();
        session.name = "WDC 2018";

        const homePage = new HomePage();
        homePage.navigateTo();

        const sessionPage = homePage.createSession();
        sessionPage.changeSession(session);

        expect(sessionPage.title).toBe(session.name);
    });
});

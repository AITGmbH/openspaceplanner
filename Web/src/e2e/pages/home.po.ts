import { browser, by, element } from "protractor";
import { SessionPage } from "./session.po";

export class HomePage {
    private get createSessionButton() { return element(by.id("createSession")); }

    public createSession(): SessionPage
    {
        this.createSessionButton.click();
        return new SessionPage();
    }

    public navigateTo() { browser.get("/"); }
}

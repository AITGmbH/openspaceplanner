import { browser, by, element } from "protractor";
import { Session } from "../../app/models/session";

export class SessionPage {
    private get editButton() { return element(by.className("edit-button")); }

    private get sessionNameInput() { return element(by.css("app-session-modal #name")); }

    private get sessionSaveButton() { return element(by.css("app-session-modal #save")); }

    private get sessionTitleText() { return element(by.className("title")); }

    public get title() { return this.sessionTitleText.getText(); }

    public changeSession(session: Session) {
        this.editButton.click();

        this.sessionNameInput.clear();
        this.sessionNameInput.sendKeys(session.name);

        this.sessionSaveButton.click();
    }

    public navigateTo() { browser.get("/"); }
}

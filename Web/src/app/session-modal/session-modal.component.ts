import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Session } from "../models/session";
import { ModalDialogComponent } from "../modal-dialog/modal-dialog.component";
import { SessionService } from "../session/session.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-session-modal",
  templateUrl: "./session-modal.component.html"
})
export class SessionModalComponent {
  private _item: Session;

  @Output()
  public close = new EventEmitter();

  @Input()
  public isShown = false;

  @Input()
  public get item() {
    return this._item || new Session();
  }

  public set item(value) {
    this._item = value;
  }

  constructor(private sessionService: SessionService, private router: Router) { }

  public save() {
    this.sessionService.update(this.item);
  }

  public onClose() {
    this.close.next();
  }

  public resetRatings() {
    if (confirm("Do you really want to reset the ratings?")) {
      this.sessionService.resetRatings();
    }
  }

  public resetAttendance() {
    if (confirm("Do you really want to reset the attendance?")) {
      this.sessionService.resetAttendance();
    }
  }

  public async delete() {
    await this.sessionService.delete(this.item.id);
    this.sessionService.currentSession = null;

    this.router.navigate(["/"]);
  }
}

import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { SessionService } from "../session/session.service";
import { Observable } from "rxjs";
import { Session } from "../models/session";

@Component({
  selector: "app-create-session",
  templateUrl: "./create-session.component.html",
  styleUrls: ["create-session.component.css"]
})
export class CreateSessionComponent {
  public isLoadingSessions: boolean = false;

  public model = {
    sessionId: ""
  };

  public lastSessions$: Observable<Session[]>;

  constructor(private sessionService: SessionService, private router: Router) {
    const busyTimeout = setTimeout(() => { this.isLoadingSessions = true; }, 300);

    this.lastSessions$ = this.sessionService.getLastSessions();
    this.lastSessions$.subscribe(() => {
      clearTimeout(busyTimeout);
      this.isLoadingSessions = false;
    });
  }

  public async createSession() {
    const session = await this.sessionService.update();
    this.router.navigate(["/session", session.id]);
  }

  public joinSession() {
    this.router.navigate(["/session", this.model.sessionId]);
  }

  public enter() {
    if (this.model.sessionId.trim() === "") {
      this.createSession();
    } else {
      this.joinSession();
    }
  }
}

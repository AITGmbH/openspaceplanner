import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, take, tap } from "rxjs";
import { SessionService } from "../session/session.service";
import { Session } from '../shared/services/api';

@Component({
  selector: "app-create-session",
  templateUrl: "./create-session.component.html",
  styleUrls: ["create-session.component.css"]
})
export class CreateSessionComponent implements OnInit {
  public isLoadingSessions: boolean = false;

  public model = {
    sessionId: ""
  };

  public lastSessions$!: Observable<Session[]>;

  constructor(private sessionService: SessionService, private router: Router) { }

  public ngOnInit() {
    const busyTimeout = setTimeout(() => { this.isLoadingSessions = true; }, 300);

    this.lastSessions$ = this.sessionService.getLastSessions()
      .pipe(take(1), tap(() => {
        clearTimeout(busyTimeout);
        this.isLoadingSessions = false;
      }));
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

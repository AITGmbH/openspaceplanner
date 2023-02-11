import {
  Component, EventEmitter, Input, OnInit, Output, ViewChild
} from "@angular/core";
import { Router } from "@angular/router";
import { NgSelectComponent } from "@ng-select/ng-select";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { SessionService } from "../session/session.service";
import { Session, Topic } from '../shared/services/api';

@Component({
  selector: "app-session-modal",
  templateUrl: "./session-modal.component.html",
})
export class SessionModalComponent implements OnInit {
  private _item: Session = {} as Session;

  public selectedSession: Session = {} as Session;
  public selectedTab: string = "session";
  public sessions$!: Observable<Session[]>;

  @ViewChild("sessionsElement")
  public sessionsElement!: NgSelectComponent;

  @Output()
  public close = new EventEmitter();

  @Input()
  public isShown = false;

  @Input()
  public get item() {
    return this._item;
  }

  public set item(value) {
    if (!value) return;
    this._item = value;
  }

  constructor(
    private sessionService: SessionService,
    private router: Router
  ) { }

  public ngOnInit() {
    this.sessions$ = this.sessionService
      .getAll()
      .pipe(
        map((s) =>
          s.filter(
            (s) => s.id != this.sessionService.currentSession.id
          ).sort((a, b) => {
            return (a.id > b.id) ? -1 : 1;
          })
        )
      );
  }

  public save() {
    this.sessionService.update(this.item);
  }

  public onClose() {
    this.sessionsElement?.close();
    this.close.next(null);
  }

  public selectTab(tabName: string) {
    this.selectedTab = tabName;
  }

  public importAll() {
    if (
      confirm(
        "Do you really want to import the slots and rooms of the selected session? All slots and rooms in the current session will be deleted."
      )
    ) {
      this.sessionService.currentSession.rooms =
        this.selectedSession.rooms;
      this.sessionService.currentSession.slots =
        this.selectedSession.slots;

      this.sessionService.update(this.sessionService.currentSession);
    }
  }

  public importRooms() {
    if (
      confirm(
        "Do you really want to import the rooms of the selected session? All rooms in the current session will be deleted."
      )
    ) {
      this.sessionService.currentSession.rooms =
        this.selectedSession.rooms;

      this.sessionService.update(this.sessionService.currentSession);
    }
  }

  public importSlots() {
    if (
      confirm(
        "Do you really want to import the slots of the selected session? All slots in the current session will be deleted."
      )
    ) {
      this.sessionService.currentSession.slots =
        this.selectedSession.slots;

      this.sessionService.update(this.sessionService.currentSession);
    }
  }

  public deleteRooms() {
    if (confirm("Do you really want to delete all rooms?")) {
      this.sessionService.currentSession.rooms = [];

      this.sessionService.currentSession.topics = this.sessionService.currentSession.topics.map((topic: Topic) => ({
        ...topic,
        slotId: null,
        roomId: null
      }));

      this.sessionService.update(this.sessionService.currentSession);
    }
  }

  public deleteSlots() {
    if (confirm("Do you really want to delete all slots?")) {
      this.sessionService.currentSession.slots = [];

      this.sessionService.currentSession.topics = this.sessionService.currentSession.topics.map((topic: Topic) => ({
        ...topic,
        slotId: null,
        roomId: null
      }));

      this.sessionService.update(this.sessionService.currentSession);
    }
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
    this.router.navigate(["/"]);
  }
}

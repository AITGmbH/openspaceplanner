import {
    Component,
    Input,
    Output,
    EventEmitter,
    ViewChild,
    OnInit,
} from "@angular/core";
import { Session } from "../models/session";
import { SessionService } from "../session/session.service";
import { Router } from "@angular/router";
import { NgSelectComponent } from "@ng-select/ng-select";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Component({
    selector: "app-session-modal",
    templateUrl: "./session-modal.component.html",
})
export class SessionModalComponent implements OnInit {
    private _item: Session;

    public selectedSession: Session;

    public selectedTab: string = "session";

    public sessions$: Observable<Session[]>;

    @ViewChild("sessionsElement", { static: false })
    public sessionsElement: NgSelectComponent;

    @Output()
    public close = new EventEmitter();

    @Input()
    public isShown = false;

    @Input()
    public get item() {
        return this._item || new Session();
    }

    public set item(value) {
        if (!value) return;
        this._item = value;
    }

    constructor(
        private sessionService: SessionService,
        private router: Router
    ) {}

    public ngOnInit() {
        this.sessions$ = this.sessionService
            .getAll()
            .pipe(
                map((s) =>
                    s.filter(
                        (s) => s.id != this.sessionService.currentSession.id
                    )
                )
            );
    }

    public save() {
        this.sessionService.update(this.item);
    }

    public onClose() {
        this.sessionsElement.close();
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
        this.sessionService.currentSession = null;

        this.router.navigate(["/"]);
    }
}

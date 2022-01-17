import {
    Component,
    Input,
    Output,
    EventEmitter,
    ViewChild,
} from "@angular/core";
import { Room } from "../models/room";
import { SessionService } from "../session/session.service";
import * as _ from "lodash";
import { NgSelectComponent } from "@ng-select/ng-select";

@Component({
    selector: "app-room-modal",
    templateUrl: "./room-modal.component.html",
})
export class RoomModalComponent {
    private _item: Room;
    private _capabilities: string[];

    @ViewChild("capabilitiesElement", { static: true })
    public capabilitiesElement: NgSelectComponent;

    @Output()
    public close = new EventEmitter();

    @Input()
    public isShown = false;

    @Input()
    public get item() {
        return this._item || new Room();
    }

    public set item(value) {
        if (!value) return;
        this._item = value;
    }

    public get capabilities() {
        if (this.sessionService.currentSession == null) {
            return [];
        }

        if (this._capabilities != null) {
            return this._capabilities;
        }

        try {
            this._capabilities = _.uniq(
                this.sessionService.currentSession.rooms
                    .map((r) => r.capabilities)
                    .reduce((a, b) => a.concat(b))
                    .concat(
                        this.sessionService.currentSession.topics
                            .map((r) => r.demands)
                            .reduce((a, b) => a.concat(b))
                    )
            );
        } catch {
            this._capabilities = [];
        }

        return this._capabilities;
    }

    constructor(private sessionService: SessionService) {}

    public save() {
        this.sessionService.updateRoom(this.item);
    }

    public delete() {
        this.sessionService.deleteRoom(this.item.id);
    }

<<<<<<< HEAD
  public delete() {
    this.sessionService.deleteRoom(this.item.id);
  }

  public onClose() {
    this.capabilitiesElement.close();
    this.close.next(null);
  }
=======
    public onClose() {
        this.capabilitiesElement.close();
        this.close.next();
    }
>>>>>>> features/topic-multiple-slots
}

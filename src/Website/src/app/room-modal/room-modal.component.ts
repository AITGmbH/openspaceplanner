import {
  Component, EventEmitter, Input,
  Output, ViewChild
} from "@angular/core";
import { NgSelectComponent } from "@ng-select/ng-select";
import { SessionService } from "../session/session.service";
import { Room, Topic } from '../shared/services/api';

@Component({
  selector: "app-room-modal",
  templateUrl: "./room-modal.component.html",
})
export class RoomModalComponent {
  private _item: Room = {} as Room;
  private _capabilities: string[] = [];

  @ViewChild("capabilitiesElement", { static: true })
  public capabilitiesElement!: NgSelectComponent;

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

  public get capabilities() {
    if (this.sessionService.currentSession == null) {
      return [];
    }

    if (this._capabilities != null) {
      return this._capabilities;
    }

    try {
      var demands = this.sessionService.currentSession.rooms
        .map((r: Room) => r.capabilities)
        .reduce((a: string[], b: string[]) => a.concat(b))
        .concat(
          this.sessionService.currentSession.topics
            .map((r: Topic) => r.demands)
            .reduce((a: string[], b: string[]) => a.concat(b))
        );

      this._capabilities = [...new Set(demands)] as string[];
    } catch {
      this._capabilities = [];
    }

    return this._capabilities;
  }

  constructor(private sessionService: SessionService) { }

  public save() {
    this.sessionService.updateRoom(this.item);
  }

  public delete() {
    this.sessionService.deleteRoom(this.item.id);
  }

  public onClose() {
    this.capabilitiesElement.close();
    this.close.next(null);
  }
}

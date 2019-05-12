import * as _ from "lodash";
import {
    Component,
    EventEmitter,
    Input,
    Output,
    ViewChild
    } from "@angular/core";
import { NgSelectComponent } from "@ng-select/ng-select";
import { Room } from "../models/room";
import { SessionService } from "../session/session.service";

@Component({
  selector: 'app-room-modal',
  templateUrl: './room-modal.component.html'
})
export class RoomModalComponent {
  private _item: Room;
  private _capabilities: string[];

  @ViewChild('capabilitiesElement') public capabilitiesElement: NgSelectComponent;

  @Output()
  public close = new EventEmitter();

  @Input()
  public isShown = false;

  @Input()
  public get item() {
    return this._item || new Room();
  }

  public set item(value) {
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
      this._capabilities = _.uniq(this.sessionService.currentSession.rooms.map(r => r.capabilities).reduce((a, b) => a.concat(b))
        .concat(this.sessionService.currentSession.topics.map(r => r.demands).reduce((a, b) => a.concat(b))));
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
    if (this.capabilitiesElement != null) {
        this.capabilitiesElement.close();
    }

    this.close.next();
  }
}

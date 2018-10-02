import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Room } from '../models/room';
import { ModalDialogComponent } from '../modal-dialog/modal-dialog.component';
import { SessionService } from '../session/session.service';

@Component({
  selector: 'app-room-modal',
  templateUrl: './room-modal.component.html'
})
export class RoomModalComponent {
  private _item: Room;

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

  constructor(private sessionService: SessionService) { }

  public save() {
    this.sessionService.updateRoom(this.item);
  }

  public delete() {
    this.sessionService.deleteRoom(this.item.id);
  }

  public onClose() {
    this.close.next();
  }
}

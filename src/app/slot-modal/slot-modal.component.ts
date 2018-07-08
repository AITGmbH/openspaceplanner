import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Slot } from '../models/slot';
import { ModalDialogComponent } from '../modal-dialog/modal-dialog.component';
import { SessionService } from '../session/session.service';

@Component({
  selector: 'app-slot-modal',
  templateUrl: './slot-modal.component.html'
})
export class SlotModalComponent {
  private _item: Slot;

  @Output()
  public close = new EventEmitter();

  @Input()
  public isShown = false;

  @Input()
  public get item() {
    return this._item || new Slot();
  }

  public set item(value) {
    this._item = value;
  }

  constructor(private sessionService: SessionService) { }

  public save() {
    this.sessionService.updateSlot(this.item);
  }

  public delete() {
    this.sessionService.deleteSlot(this.item.id);
  }

  public onClose() {
    this.close.next();
  }
}

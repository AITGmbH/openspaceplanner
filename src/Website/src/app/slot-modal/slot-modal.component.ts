import { Component, EventEmitter, Input, Output } from "@angular/core";
import { SessionService } from "../session/session.service";
import { Slot } from '../shared/services/api';

@Component({
  selector: "app-slot-modal",
  templateUrl: "./slot-modal.component.html",
})
export class SlotModalComponent {
  private _item: Slot = {} as Slot;

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
    if (value.id == null) {
      value.isPlanable = true;
    }
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
    this.close.next(null);
  }
}

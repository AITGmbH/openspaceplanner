import {
  Component, ElementRef, EventEmitter, HostListener, Input, Output
} from "@angular/core";

@Component({
  selector: "app-modal-dialog",
  templateUrl: "./modal-dialog.component.html",
})
export class ModalDialogComponent {
  private _isShown = false;

  @Output()
  public save = new EventEmitter();

  @Output()
  public close = new EventEmitter();

  @Output()
  public delete = new EventEmitter();

  @Input()
  public set isShown(value: boolean) {
    this._isShown = value;

    if (this._isShown) {
      const firstInput =
        this._elementRef.nativeElement.querySelector("input");
      if (firstInput != null) {
        setTimeout(() => {
          firstInput.focus();
        });
      }
    }

    if (!this._isShown && value) {
      this.close.next(null);
    }
  }

  public get isShown() {
    return this._isShown;
  }

  @Input()
  public title: string = "";

  @Input()
  public showDeleteButton = true;

  constructor(private _elementRef: ElementRef) { }

  @HostListener("document:keyup", ["$event"])
  public keyup(event: KeyboardEvent) {
    if (this.isShown) {
      if ((event.ctrlKey || event.shiftKey) && event.key === "Enter") {
        this.saveInternal();
      }

      if (event.key === "Escape") {
        this.closeInternal();
      }
    }
  }

  public saveInternal() {
    this.save.next(null);
    this.closeInternal();
  }

  public closeInternal() {
    this.isShown = false;
    this.close.next(null);
  }

  public deleteInternal() {
    if (confirm("Do you really want to delete this item?")) {
      this.delete.next(null);
      this.closeInternal();
    }
  }
}

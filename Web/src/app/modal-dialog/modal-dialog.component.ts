import { Component, OnInit, EventEmitter, Output, Input, HostListener } from '@angular/core';

@Component({
  selector: 'app-modal-dialog',
  templateUrl: './modal-dialog.component.html'
})
export class ModalDialogComponent {
  @Output()
  public save = new EventEmitter();

  @Output()
  public close = new EventEmitter();

  @Output()
  public delete = new EventEmitter();

  @Input()
  public isShown = false;

  @Input()
  public title: string;

  @Input()
  public showDeleteButton = true;

  @HostListener('document:keyup', ['$event'])
  public keyup(event: KeyboardEvent) {
    if (this.isShown) {
      if (event.ctrlKey && event.key === 'Enter') {
        this.saveInternal();
      }

      if (event.key === 'Escape') {
        this.closeInternal();
      }
    }
  }

  public saveInternal() {
    this.closeInternal();
    this.save.next();
  }

  public closeInternal() {
    this.isShown = false;
    this.close.next();
  }

  public deleteInternal() {
    if (confirm('Do you really want to delete this item?')) {
      this.closeInternal();
      this.delete.next();
    }
  }
}

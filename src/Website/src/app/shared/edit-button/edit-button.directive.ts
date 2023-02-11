import { Directive, ElementRef, HostListener, Input } from "@angular/core";

@Directive({
  selector: "[appEditButton]"
})
export class EditButtonDirective {
  @Input() public appHoverButton?: number;

  constructor(private el: ElementRef) { }

  @HostListener("mouseenter") onMouseEnter() {
    const buttons = this.el.nativeElement.querySelectorAll(".edit-button");
    for (const button of buttons) {
      button.style.opacity = 1;
    }
  }

  @HostListener("mouseleave") onMouseLeave() {
    const buttons = this.el.nativeElement.querySelectorAll(".edit-button");
    for (const button of buttons) {
      button.style.opacity = this.appHoverButton || 0;
    }
  }
}

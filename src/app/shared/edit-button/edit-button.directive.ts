import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[appEditButton]'
})
export class EditButtonDirective {
    @Input() public appHoverButton: number;

    constructor(private el: ElementRef) { }

    @HostListener('mouseenter') onMouseEnter() {
        const button = this.el.nativeElement.querySelector('.edit-button');
        if (button != null) {
            button.style.opacity = 1;
        }
    }

    @HostListener('mouseleave') onMouseLeave() {
        const button = this.el.nativeElement.querySelector('.edit-button');
        if (button != null) {
            button.style.opacity = this.appHoverButton || 0;
        }
    }
}

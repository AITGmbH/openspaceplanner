import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-busy-spinner',
  templateUrl: './busy-spinner.component.html',
  styleUrls: ['./busy-spinner.component.css']
})
export class BusySpinnerComponent {
  @Input() public isBusy: boolean = false;
}

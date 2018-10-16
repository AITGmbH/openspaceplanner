import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { SessionComponent } from './session/session.component';
import { CreateSessionComponent } from './create-session/create-session.component';
import { SessionService } from './session/session.service';
import { SessionTopicBoxComponent } from './session-topic-box/session-topic-box.component';
import { TopicModalComponent } from './topic-modal/topic-modal.component';
import { RoomModalComponent } from './room-modal/room-modal.component';
import { SlotModalComponent } from './slot-modal/slot-modal.component';
import { ModalDialogComponent } from './modal-dialog/modal-dialog.component';
import { SessionOverviewComponent } from './session-overview/session-overview.component';
import { SessionModalComponent } from './session-modal/session-modal.component';
import { ApplicationInsightsModule } from '@markpieszak/ng-application-insights';
import { EditButtonDirective } from './shared/edit-button/edit-button.directive';
import { BusySpinnerComponent } from './shared/busy-spinner/busy-spinner.component';

@NgModule({
  declarations: [
    AppComponent,
    SessionComponent,
    CreateSessionComponent,
    SessionTopicBoxComponent,
    TopicModalComponent,
    RoomModalComponent,
    SlotModalComponent,
    SessionModalComponent,
    ModalDialogComponent,
    SessionOverviewComponent,
    EditButtonDirective,
    BusySpinnerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ApplicationInsightsModule.forRoot({
      instrumentationKeySetlater: true
    })
  ],
  providers: [
    SessionService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

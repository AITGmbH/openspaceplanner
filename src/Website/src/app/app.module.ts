import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';

import { NgSelectModule } from "@ng-select/ng-select";
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { CreateSessionComponent } from './create-session/create-session.component';
import { ModalDialogComponent } from './modal-dialog/modal-dialog.component';
import { RoomModalComponent } from './room-modal/room-modal.component';
import { SessionModalComponent } from './session-modal/session-modal.component';
import { SessionOverviewComponent } from './session-overview/session-overview.component';
import { SessionTopicBoxComponent } from './session-topic-box/session-topic-box.component';
import { SessionComponent } from './session/session.component';
import { SessionService } from './session/session.service';
import { BusySpinnerComponent } from './shared/busy-spinner/busy-spinner.component';
import { EditButtonDirective } from './shared/edit-button/edit-button.directive';
import { ApiModule, Configuration } from './shared/services/api';
import { SlotModalComponent } from './slot-modal/slot-modal.component';
import { TopicModalComponent } from './topic-modal/topic-modal.component';

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
    NgSelectModule,
    FormsModule, ApiModule.forRoot(
      () =>
        new Configuration({
          basePath: environment.apiUrl,
        })
    ),
  ],
  providers: [
    SessionService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

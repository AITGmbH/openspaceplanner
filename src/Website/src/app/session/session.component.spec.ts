import { ComponentFixture, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { instance, mock, verify, when } from '@johanblumenberg/ts-mockito';
import { RenderResult, render } from '@testing-library/angular';
import { Subject } from 'rxjs';
import { RoomModalComponent } from '../room-modal/room-modal.component';
import { SessionModalComponent } from '../session-modal/session-modal.component';
import { Session } from '../shared/services/api';
import { SlotModalComponent } from '../slot-modal/slot-modal.component';
import { TopicModalComponent } from '../topic-modal/topic-modal.component';
import { ModalDialogComponent } from './../modal-dialog/modal-dialog.component';
import { SessionTopicBoxComponent } from './../session-topic-box/session-topic-box.component';
import { SessionComponent } from './session.component';
import { SessionService } from './session.service';

describe('SessionComponent', () => {
  const session: Session = {} as Session;
  session.id = 3;
  session.name = 'Session 3';

  let component: RenderResult<SessionComponent, SessionComponent>;
  let fixture: ComponentFixture<SessionComponent>;
  let sessionServiceMock: SessionService;
  let routerMock: Router;

  beforeEach(waitForAsync(async () => {
    sessionServiceMock = mock(SessionService);
    when(sessionServiceMock.get(session.id)).thenResolve(session);
    when(sessionServiceMock.currentSession).thenReturn(session);
    when(sessionServiceMock.sessionChanged).thenReturn(new Subject());

    routerMock = mock(Router);

    component = await render(SessionComponent, {
      imports: [BrowserModule, FormsModule],
      declarations: [SessionComponent, SessionTopicBoxComponent, TopicModalComponent, RoomModalComponent, SlotModalComponent, SessionModalComponent, ModalDialogComponent],
      providers: [
        { provide: SessionService, useFactory: () => instance(sessionServiceMock) },
        { provide: Router, useFactory: () => instance(routerMock) },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => session.id,
              },
            },
          },
        },
      ],
    });
  }));

  it('should create', () => {
    expect(component.container).toBeTruthy();
  });

  it('should get sessions', () => {
    verify(sessionServiceMock.get(session.id)).once();

    expect(component.fixture.componentInstance.session).not.toBeNull();
    expect(component.fixture.componentInstance.session?.id).toBe(session.id);
  });
});

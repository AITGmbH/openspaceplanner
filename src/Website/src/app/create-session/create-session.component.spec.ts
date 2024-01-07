import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { instance, mock, when } from '@johanblumenberg/ts-mockito';
import { Subject } from 'rxjs';
import { SessionService } from '../session/session.service';
import { BusySpinnerComponent } from '../shared/busy-spinner/busy-spinner.component';
import { Session } from '../shared/services/api';
import { CreateSessionComponent } from './create-session.component';

describe('create session', () => {
  it('should only display busy spinner if not loaded in time', fakeAsync(() => {
    const lastSessions$ = new Subject<Session[]>();

    const sessionServiceMock = mock(SessionService);
    when(sessionServiceMock.getLastSessions()).thenReturn(lastSessions$.asObservable());

    TestBed.configureTestingModule({
      imports: [BrowserModule, FormsModule],
      declarations: [CreateSessionComponent, BusySpinnerComponent],
      providers: [
        { provide: SessionService, useFactory: () => instance(sessionServiceMock) },
        { provide: Router, useFactory: () => { } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CreateSessionComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    expect(comp.isLoadingSessions).toBeFalsy();

    tick(300);
    expect(comp.isLoadingSessions).toBeTruthy();

    lastSessions$.next([]);
    expect(comp.isLoadingSessions).toBeFalsy();
  }));
});

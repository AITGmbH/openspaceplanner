import { anyNumber, anyString, instance, mock, verify, when } from '@johanblumenberg/ts-mockito';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { of } from 'rxjs';
import { Session, SessionRoomsService, SessionSlotsService, SessionTopicsAttendanceService, SessionTopicsFeedbackService, SessionTopicsRatingService, SessionTopicsService, SessionsService } from '../shared/services/api';
import { SessionService } from './session.service';

const hubConnectionMock = mock(HubConnection);
when(hubConnectionMock.start()).thenReturn(Promise.resolve());

const hubConnectionBuilderMock = mock(HubConnectionBuilder);
when(hubConnectionBuilderMock.withUrl(anyString())).thenReturn(instance(hubConnectionBuilderMock));
when(hubConnectionBuilderMock.build()).thenReturn(instance(hubConnectionMock));

describe('session service', () => {
  it('get session should set it as the current session', async () => {
    const sessionsServiceMock = mock(SessionsService);
    when(sessionsServiceMock.getSessionById(anyNumber())).thenReturn(of({ id: 5 } as Session));

    const sessionService = new SessionService(
      instance(sessionsServiceMock),
      instance(mock(SessionTopicsService)),
      instance(mock(SessionSlotsService)),
      instance(mock(SessionRoomsService)),
      instance(mock(SessionTopicsAttendanceService)),
      instance(mock(SessionTopicsRatingService)),
      instance(mock(SessionTopicsFeedbackService)),
      instance(hubConnectionBuilderMock),
    );
    const session = await sessionService.get(5);

    expect(sessionService.currentSession).toBe(session);
    verify(hubConnectionMock.start()).once();
  });
});

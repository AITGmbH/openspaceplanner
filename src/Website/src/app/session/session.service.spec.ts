import { HttpClient } from '@angular/common/http';
import { anyString, instance, mock, verify, when } from '@johanblumenberg/ts-mockito';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { of } from 'rxjs';
import { SessionService } from './session.service';

const hubConnectionMock = mock(HubConnection);
when(hubConnectionMock.start()).thenReturn(Promise.resolve());

const hubConnectionBuilderMock = mock(HubConnectionBuilder);
when(hubConnectionBuilderMock.withUrl(anyString())).thenReturn(instance(hubConnectionBuilderMock));
when(hubConnectionBuilderMock.build()).thenReturn(instance(hubConnectionMock));

describe('session service', () => {
  it('get session should set it as the current session', async () => {
    const httpClientMock = mock(HttpClient);
    when(httpClientMock.get(anyString())).thenReturn(of(<Object>{ id: 5 }));

    const sessionService = new SessionService(instance(httpClientMock), instance(hubConnectionBuilderMock));
    const session = await sessionService.get(5);

    expect(sessionService.currentSession).toBe(session);
    verify(hubConnectionMock.start()).once();
  });
});

import { anything, instance, mock, when } from '@johanblumenberg/ts-mockito';
import { render } from '@testing-library/angular';
import { SessionService } from '../session/session.service';
import { Attendance, Room, Session, Slot, Topic } from '../shared/services/api';
import { SessionTopicBoxComponent } from './session-topic-box.component';

describe('session topic box', () => {
  it('should set error message when there is one owner with two topics in the same slot', () => {
    const room1 = { id: '1' } as Room;
    const room2 = { id: '2' } as Room;

    const slot1 = { id: '1' } as Slot;

    const topic1 = { id: '1', owner: 'Test', slotId: '1', roomId: '1', attendees: [] as Attendance[] } as Topic;
    const topic2 = { id: '2', owner: 'Test', slotId: '1', roomId: '2', attendees: [] as Attendance[] } as Topic;

    const session = { topics: [topic1, topic2], rooms: [room1, room2], slots: [slot1] } as Session;

    const sessionServiceMock = mock(SessionService);
    when(sessionServiceMock.currentSession).thenReturn(session);
    when(sessionServiceMock.getSlotsOfTopic(anything(), anything())).thenReturn([slot1]);

    const comp = new SessionTopicBoxComponent(instance(sessionServiceMock));
    comp.topic = session.topics[0];

    expect(comp.hasError).toBeTruthy();
    expect(comp.errors[0]).toBe('Owner with two or more topics in the same slot.');
  });

  it('should display error message when there are errors', async () => {
    const room1 = { id: '1' } as Room;
    const room2 = { id: '2' } as Room;

    const slot1 = { id: '1' } as Slot;

    const topic1 = { id: '1', owner: 'Test', slotId: '1', roomId: '1', attendees: [] as Attendance[] } as Topic;
    const topic2 = { id: '2', owner: 'Test', slotId: '1', roomId: '2', attendees: [] as Attendance[] } as Topic;

    const session = { topics: [topic1, topic2], rooms: [room1, room2], slots: [slot1] } as Session;

    const sessionServiceMock = mock(SessionService);
    when(sessionServiceMock.currentSession).thenReturn(session);
    when(sessionServiceMock.getSlotsOfTopic(anything(), anything())).thenReturn([slot1]);

    const component = await render(SessionTopicBoxComponent, {
      providers: [{ provide: SessionService, useFactory: () => instance(sessionServiceMock) }],
      componentInputs: { topic: topic1 },
    });

    const errorContainerElement = component.container.querySelector('.topic-error')?.parentElement;
    expect(errorContainerElement?.style?.display).toBe('');
  });

  it('should set error message when there is one owner with two topics in the same slot (snapshot)', async () => {
    const room1 = { id: '1' } as Room;
    const room2 = { id: '2' } as Room;

    const slot1 = { id: '1' } as Slot;

    const topic1 = { id: '1', owner: 'Test', slotId: '1', roomId: '1', attendees: [] as Attendance[] } as Topic;
    const topic2 = { id: '2', owner: 'Test', slotId: '1', roomId: '2', attendees: [] as Attendance[] } as Topic;

    const session = { topics: [topic1, topic2], rooms: [room1, room2], slots: [slot1] } as Session;

    const sessionServiceMock = mock(SessionService);
    when(sessionServiceMock.currentSession).thenReturn(session);
    when(sessionServiceMock.getSlotsOfTopic(anything(), anything())).thenReturn([slot1]);

    const component = await render(SessionTopicBoxComponent, {
      providers: [{ provide: SessionService, useFactory: () => instance(sessionServiceMock) }],
      componentInputs: { topic: topic1 },
    });

    expect(component.fixture.nativeElement).toMatchSnapshot();
  });
});

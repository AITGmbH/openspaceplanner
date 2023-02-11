import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import * as moq from "typemoq";
import { SessionService } from "../session/session.service";
import { Session, Topic } from '../shared/services/api';
import { SessionTopicBoxComponent } from "./session-topic-box.component";

describe("session topic box", () => {
  it("should set error message when there is one owner with two topics in the same slot", () => {
    const session = {} as Session;
    session.topics.push(<Topic>{ owner: "Test", slotId: "1", roomId: "1" });
    session.topics.push(<Topic>{ owner: "Test", slotId: "1", roomId: "2" });

    const sessionServiceMock = moq.Mock.ofType<SessionService>();
    sessionServiceMock.setup(s => s.currentSession).returns(() => session);

    const comp = new SessionTopicBoxComponent(sessionServiceMock.object);
    comp.topic = session.topics[0];

    expect(comp.hasError).toBeTruthy();
    expect(comp.errors[0]).toBe("Owner with two or more topics in the same slot.");
  });

  it("should display error message when there are errors", () => {
    const session = {} as Session;
    session.topics.push(<Topic>{ owner: "Test", slotId: "1", roomId: "1" });
    session.topics.push(<Topic>{ owner: "Test", slotId: "1", roomId: "2" });

    const sessionServiceMock = moq.Mock.ofType<SessionService>();
    sessionServiceMock.setup(s => s.currentSession).returns(() => session);

    TestBed.configureTestingModule({
      declarations: [
        SessionTopicBoxComponent
      ],
      providers: [
        { provide: SessionService, useFactory: () => sessionServiceMock.object }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(SessionTopicBoxComponent);
    const debugElement = fixture.debugElement;
    const comp = fixture.componentInstance;
    comp.topic = session.topics[0];

    fixture.detectChanges();

    const errorContainerElement: HTMLElement
      = debugElement.query(By.css(".topic-error")).parent?.nativeElement;

    expect(errorContainerElement.style.display).toBe("");
  });

  it("should set error message when there is one owner with two topics in the same slot (snapshot)", () => {
    const session = {} as Session;
    session.topics.push(<Topic>{ owner: "Test", slotId: "1", roomId: "1" });
    session.topics.push(<Topic>{ owner: "Test", slotId: "1", roomId: "2" });

    const sessionServiceMock = moq.Mock.ofType<SessionService>();
    sessionServiceMock.setup(s => s.currentSession).returns(() => session);

    TestBed.configureTestingModule({
      declarations: [
        SessionTopicBoxComponent
      ],
      providers: [
        { provide: SessionService, useFactory: () => sessionServiceMock.object }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(SessionTopicBoxComponent);
    const comp = fixture.componentInstance;
    comp.topic = session.topics[0];

    fixture.detectChanges();

    expect(fixture.nativeElement).toMatchSnapshot();
  });
});

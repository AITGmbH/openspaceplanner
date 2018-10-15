import { SessionService } from "./session.service";
import { ModalDialogComponent } from "./../modal-dialog/modal-dialog.component";
import { SessionTopicBoxComponent } from "./../session-topic-box/session-topic-box.component";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import * as typemoq from "typemoq";

import { SessionComponent } from "./session.component";
import { TopicModalComponent } from "../topic-modal/topic-modal.component";
import { RoomModalComponent } from "../room-modal/room-modal.component";
import { SlotModalComponent } from "../slot-modal/slot-modal.component";
import { SessionModalComponent } from "../session-modal/session-modal.component";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { Session } from "../models/session";

describe("SessionComponent", () => {
    const session: Session = new Session();
    session.id = 3;
    session.name = "Session 3";

    let component: SessionComponent;
    let fixture: ComponentFixture<SessionComponent>;
    let sessionServiceMock: typemoq.IMock<SessionService>;
    let routerMock: typemoq.IMock<Router>;

    beforeEach(async(() => {
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => { return { matches: false } })
        });

        sessionServiceMock = typemoq.Mock.ofType<SessionService>();

        sessionServiceMock.setup(s => s.get(typemoq.It.isValue(session.id)))
            .returns(() => Promise.resolve(session));

        sessionServiceMock.setup(s => s.currentSession)
            .returns(() => session);

        routerMock = typemoq.Mock.ofType<Router>();

        TestBed.configureTestingModule({
            imports: [
                BrowserModule,
                FormsModule,
            ],
            declarations: [
                SessionComponent,
                SessionTopicBoxComponent,
                TopicModalComponent,
                RoomModalComponent,
                SlotModalComponent,
                SessionModalComponent,
                ModalDialogComponent
            ],
            providers: [
                {provide: SessionService, useFactory: () => sessionServiceMock.object},
                {provide: Router, useFactory: () => routerMock.object},
                {provide: ActivatedRoute, useValue: {
                    snapshot: { 
                        paramMap: {
                            get: () => session.id
                        }
                    }
                  }
                }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SessionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("should get sessions", () => {
        sessionServiceMock.verify(s => s.get(typemoq.It.isValue(session.id)), typemoq.Times.once());

        expect(component.session).not.toBeNull();
        expect(component.session.id).toBe(session.id);
    });
});
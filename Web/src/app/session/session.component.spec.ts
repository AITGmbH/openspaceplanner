import { FeatureFlagService } from "./../shared/feature-flags/feature-flags.service";
import { SessionService } from "./session.service";
import { ModalDialogComponent } from "./../modal-dialog/modal-dialog.component";
import { SessionTopicBoxComponent } from "./../session-topic-box/session-topic-box.component";
import { FeatureFlagEnabledPipe } from "./../shared/feature-flags/feature-flag-enabled.pipe";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import * as moq from "typemoq";

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
    session.displayName = "Session 3";

    let component: SessionComponent;
    let fixture: ComponentFixture<SessionComponent>;
    let sessionServiceMock: moq.IMock<SessionService>;
    let routerMock: moq.IMock<Router>;
    let featureFlagServiceMock: moq.IMock<FeatureFlagService>;

    beforeEach(async(() => {
        sessionServiceMock = moq.Mock.ofType<SessionService>();

        sessionServiceMock.setup(s => s.get(moq.It.isValue(session.id)))
            .returns(() => Promise.resolve(session));

        sessionServiceMock.setup(s => s.currentSession)
            .returns(() => session);

        routerMock = moq.Mock.ofType<Router>();
        featureFlagServiceMock = moq.Mock.ofType<FeatureFlagService>();

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
                ModalDialogComponent,
                FeatureFlagEnabledPipe
            ],
            providers: [
                {provide: SessionService, useFactory: () => sessionServiceMock.object},
                {provide: FeatureFlagService, useFactory: () => featureFlagServiceMock.object},
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
        sessionServiceMock.verify(s => s.get(moq.It.isValue(session.id)), moq.Times.once());

        expect(component.session).not.toBeNull();
        expect(component.session.id).toBe(session.id);
    });
});
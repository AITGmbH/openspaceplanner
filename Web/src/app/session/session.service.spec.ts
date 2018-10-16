import { SessionService } from "./session.service";
import { HttpClient } from "@angular/common/http";
import * as typemoq from "typemoq";
import { of } from "rxjs";

import { HubConnectionBuilder, HubConnection } from "@aspnet/signalr";

const hubConnectionMock = typemoq.Mock.ofType<HubConnection>();
hubConnectionMock.setup(h => h.start()).returns(() => new Promise());

const hubConnectionBuilderMock = typemoq.Mock.ofType<HubConnectionBuilder>();
hubConnectionBuilderMock.setup(h => h.withUrl(typemoq.It.isAny())).returns(() => hubConnectionBuilderMock.object);
hubConnectionBuilderMock.setup(h => h.build()).returns(() => hubConnectionMock.object);

HubConnectionBuilder.prototype = hubConnectionBuilderMock.object;

describe("session service", () => {
    it("get session should set it as the current session", async () => {
        const httpClientMock = typemoq.Mock.ofType<HttpClient>();
        httpClientMock
            .setup(h => h.get(typemoq.It.is(s => s === "/api/sessions/5")))
            .returns(s => of(<Object>{ id: 5 }));

        const sessionService = new SessionService(httpClientMock.object);
        const session = await sessionService.get(5);

        expect(sessionService.currentSession).toBe(session);
        hubConnectionMock.verify(h => h.start(), typemoq.Times.once());
    });
});

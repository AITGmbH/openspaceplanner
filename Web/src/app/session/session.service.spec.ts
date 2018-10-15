import { SessionService } from "./session.service";
import { HttpClient } from "@angular/common/http";
import * as typemoq from "typemoq";
import { of } from "rxjs";

import { HubConnectionBuilder, HubConnection } from "@aspnet/signalr";
jest.mock("@aspnet/signalr");

HubConnectionBuilder.prototype.withUrl = jest.fn().mockImplementation(() => {
    return {
        build: jest.fn().mockImplementation(() => {
            return {
                on: jest.fn(),
                start: jest.fn().mockImplementation(() => {
                    return new Promise();
                })
            };
        })
    };
});

describe("session service", () => {
    it("get session should set it as the current session", async () => {
        const httpClientMock = typemoq.Mock.ofType<HttpClient>();
        httpClientMock
            .setup(h => h.get(typemoq.It.is(s => s === "/api/sessions/5")))
            .returns(s => of(<Object>{ id: 5 }));

        const sessionService = new SessionService(httpClientMock.object);
        const session = await sessionService.get(5);

        expect(sessionService.currentSession).toBe(session);
    });
});

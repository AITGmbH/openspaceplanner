import { Component } from "@angular/core";
import { AppInsightsService } from "@markpieszak/ng-application-insights";
import { HttpClient } from "@angular/common/http";
import { Config } from "./models/config";
import { Router } from "@angular/router";
import { SessionService } from "./session/session.service";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["app.component.css"],
})
export class AppComponent {
    constructor(
        http: HttpClient,
        appInsightsService: AppInsightsService,
        sessionService: SessionService,
        router: Router
    ) {
        http.get("api/config")
            .toPromise()
            .then((data) => {
                const config = data as Config;

                appInsightsService.config = {
                    instrumentationKey: config.instrumentationKey,
                };

                appInsightsService.init();
            });

        sessionService.sessionDeleted.subscribe((id: number) => {
            router.navigate(["/"]);
        });
    }
}

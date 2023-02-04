import { HttpClient } from "@angular/common/http";
import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { AppInsightsService } from "@markpieszak/ng-application-insights";
import { environment } from '../environments/environment';
import { Config } from "./models/config";
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
        http.get(`${environment.apiUrl}/api/config`)
            .toPromise()
            .then((data) => {
                const config = data as Config;

                appInsightsService.config = {
                    instrumentationKey: config.instrumentationKey,
                };

                appInsightsService.init();
            });

        sessionService.sessionDeleted.subscribe(_ => {
            router.navigate(["/"]);
        });
    }
}

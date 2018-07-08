import { Component } from '@angular/core';
import { AppInsightsService } from '@markpieszak/ng-application-insights';
import { HttpClient } from '@angular/common/http';
import { Config } from './models/config';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['app.component.css']
})
export class AppComponent {
  constructor(
    http: HttpClient,
    appInsightsService: AppInsightsService
  ) {
    http.get('api/config')
      .toPromise()
      .then(data => {
        const config = data as Config;

        appInsightsService.config = {
          instrumentationKey: config.instrumentationKey
        };

        appInsightsService.init();
      });
  }
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FaConfig, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { AngularPlugin } from '@microsoft/applicationinsights-angularplugin-js';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { take, tap } from 'rxjs';
import { SessionService } from './session/session.service';
import { Config, ConfigService } from './shared/services/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['app.component.css'],
})
export class AppComponent {
  constructor(sessionService: SessionService, configService: ConfigService, router: Router, faConfig: FaConfig, library: FaIconLibrary) {
    faConfig.fixedWidth = true;
    library.addIconPacks(fas);

    configService.getConfig().pipe(
      take(1),
      tap((config: Config) => {
        if (config.instrumentationKey == null) {
          return;
        }

        const angularPlugin = new AngularPlugin();
        const appInsights = new ApplicationInsights({
          config: {
            instrumentationKey: config.instrumentationKey,
            extensions: [angularPlugin],
            extensionConfig: {
              [angularPlugin.identifier]: { router },
            },
          },
        });

        appInsights.loadAppInsights();
      }),
    );

    sessionService.sessionDeleted.subscribe(() => {
      router.navigate(['/']);
    });
  }
}

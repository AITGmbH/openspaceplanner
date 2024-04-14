import { Component, OnInit } from '@angular/core';
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
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  public currentTheme: string = 'system';

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

  public ngOnInit() {
    const theme = localStorage.getItem('theme');
    if (theme != null) {
      this.changeTheme(theme);
    }
  }

  public changeTheme(theme: string) {
    const htmlElement = document.querySelector('html');
    if (htmlElement == null) {
      return;
    }

    this.currentTheme = theme;
    localStorage.setItem('theme', theme);

    if (theme === 'system') {
      htmlElement.removeAttribute('data-theme');
      return;
    }

    htmlElement.setAttribute('data-theme', theme);
  }

  public toggleBurger() {
    const navbarBurger = document.querySelector('.navbar-burger');
    const navbarMenu = document.querySelector('.navbar-menu');

    if (navbarBurger == null || navbarMenu == null) {
      return;
    }

    navbarBurger.classList.toggle('is-active');
    navbarMenu.classList.toggle('is-active');
  }

  public toggleDropdown(event: Event) {
    const target = event.target as HTMLElement;
    const dropdown = target.parentElement;

    if (dropdown == null) {
      return;
    }

    dropdown.classList.toggle('is-active');
  }
}

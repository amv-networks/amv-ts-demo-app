import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { AppConfig } from './config/app.config';
import { MatSnackBar } from '@angular/material';


declare const Modernizr;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})

export class AppComponent implements OnInit {

  isOnline: boolean;

  constructor(private translateService: TranslateService,
    private title: Title,
    private meta: Meta,
    private snackBar: MatSnackBar,
    private router: Router) {
    this.isOnline = navigator.onLine;
  }

  ngOnInit() {
    this.translateService.setDefaultLang('en');
    this.translateService.use('en');

    this.title.setTitle('amv system demo');

    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.title.setTitle('amv system demo');

        switch (event.urlAfterRedirects) {
          case '/':
            this.meta.updateTag({
              name: 'description',
              content: 'amv system demo'
            });
            break;
          case '/' + AppConfig.routes.settings:
            this.title.setTitle(this.title.getTitle() + ' - settings');
            this.meta.updateTag({
              name: 'description',
              content: 'Settings'
            });
            break;
        }
      }
    });

    this.checkBrowserFeatures();
  }

  checkBrowserFeatures() {
    let supported = true;
    for (const feature in Modernizr) {
      if (Modernizr.hasOwnProperty(feature) &&
        typeof Modernizr[feature] === 'boolean' && Modernizr[feature] === false) {
        supported = false;
        break;
      }
    }

    if (!supported) {
      this.translateService.get(['updateBrowser']).subscribe((texts) => {
        this.snackBar.open(texts['updateBrowser'], 'OK');
      });
    }

    return supported;
  }
}

import {InjectionToken} from '@angular/core';

import {IAppConfig} from './iapp.config';
import {environment} from '../../environments/environment';

export let APP_CONFIG = new InjectionToken('app.config');

export const AppConfig: IAppConfig = {
  routes: {
    faq: 'faq',
    settings: 'settings',
    heroes: 'heroes',
    box: 'box',
    error404: '404'
  },
  endpoints: {
    heroes: 'https://amv-networks.github.io/amv-ts-demo-app/heroes'
  },
  votesLimit: 3,
  topHeroesLimit: 4,
  snackBarDuration: 3000,
  repositoryURL: 'https://github.com/amv-networks/amv-ts-demo-app',
  debug: {
    enableTracing: !environment.production,
  }
};

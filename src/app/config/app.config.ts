import {InjectionToken} from '@angular/core';

import {IAppConfig} from './iapp.config';
import {environment} from '../../environments/environment';

export let APP_CONFIG = new InjectionToken('app.config');

export const AppConfig: IAppConfig = {
  routes: {
    faq: 'faq',
    settings: 'settings',
    box: 'box',
    error404: '404'
  },
  endpoints: {
  },
  repositoryURL: 'https://github.com/amv-networks/amv-ts-demo-app',
  debug: {
    enableTracing: !environment.production,
  }
};

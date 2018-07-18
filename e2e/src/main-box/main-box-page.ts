import {browser, by, element} from 'protractor';
import {AppConfig} from '../../../src/app/config/app.config';

export class MainBoxPage {
  static navigateTo(): any {
    return browser.get('/#/' + AppConfig.routes.box + '/1001');
  }

  static getPageHeaderTitle(): any {
    return element.all(by.css('h1.title')).get(0);
  }
}

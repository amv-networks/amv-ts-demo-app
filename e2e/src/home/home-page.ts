import {browser, by, element} from 'protractor';

export class HomePage {
  static navigateTo(): any {
    return browser.get('/');
  }

  static getNumberOfBoxes(): any {
    return element.all(by.css('#box-list mat-card')).count();
  }
}

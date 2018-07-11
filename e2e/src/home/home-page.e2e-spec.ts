import {AppConfig} from '../../../src/app/config/app.config';
import {HomePage} from './home-page';

describe('Home page', function () {
  let page;

  beforeEach(() => {
    page = new HomePage();
  });

  it('should contain boxes', () => {
    HomePage.navigateTo();
    expect<any>(HomePage.getNumberOfBoxes()).toBeGreaterThanOrEqual(4);
  });
});

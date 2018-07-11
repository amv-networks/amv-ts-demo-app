import {MainBoxPage} from './main-box-page';

describe('Home page', function () {
  let page;

  beforeEach(() => {
    page = new MainBoxPage();
  });

  it('should contain a page header', () => {
    MainBoxPage.navigateTo();
    expect<any>(MainBoxPage.getPageHeaderTitle().isPresent()).toBe(true);
  });
});

import { HarnessPage } from './app.po';

describe('harness App', function() {
  let page: HarnessPage;

  beforeEach(() => {
    page = new HarnessPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});

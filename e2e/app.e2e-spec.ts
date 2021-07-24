import { DiyMyOwnCookbookPage } from './app.po';

describe('diy-my-own-cookbook App', () => {
  let page: DiyMyOwnCookbookPage;

  beforeEach(() => {
    page = new DiyMyOwnCookbookPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});

import { RichPanelTaskNewPage } from './app.po';

describe('rich-panel-task-new App', function() {
  let page: RichPanelTaskNewPage;

  beforeEach(() => {
    page = new RichPanelTaskNewPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});

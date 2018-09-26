import { SearchRouteModule } from './search-route.module';

describe('SearchRouteModule', () => {
  let searchRouteModule: SearchRouteModule;

  beforeEach(() => {
    searchRouteModule = new SearchRouteModule();
  });

  it('should create an instance', () => {
    expect(searchRouteModule).toBeTruthy();
  });
});

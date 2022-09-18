import { NavigationClient } from '@azure/msal-browser';
import { NextRouter } from 'next/router';

class CustomNavigationClient extends NavigationClient {
  private router: NextRouter;

  constructor(router: NextRouter) {
    super();
    this.router = router;
  }

  /**
   * Navigates to other pages within the same web application
   * @param url
   * @param options
   */
  async navigateInternal(url: any, options: any) {
    const relativePath = url.replace(window.location.origin, '');
    if (options.noHistory) {
      this.router.replace(relativePath);
    } else {
      this.router.push(relativePath);
    }

    return false;
  }
}

export default CustomNavigationClient;

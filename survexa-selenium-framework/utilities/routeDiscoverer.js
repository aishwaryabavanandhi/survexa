const fs = require('fs');
const path = require('path');
const config = require('../config/selenium.config');
const logger = require('./logger');

class RouteDiscoverer {
  
  /**
   * Statically parses screenRoutes.js to extract list of screens
   */
  static discoverRoutes() {
    try {
      const routesPath = config.reactRoutesPath;
      if (!fs.existsSync(routesPath)) {
        logger.warn(`Routes configuration file not found at ${routesPath}. Using default fallback.`);
        return this.getFallbackRoutes();
      }

      const content = fs.readFileSync(routesPath, 'utf8');
      
      // Parse using a robust regex that extracts object fields
      const screensArrayMatch = content.match(/export\s+const\s+SURVEYFORGE_SCREENS\s*=\s*\[([\s\S]*?)\]/);
      if (!screensArrayMatch) {
        logger.warn('Could not locate SURVEYFORGE_SCREENS array in source code. Using default fallback.');
        return this.getFallbackRoutes();
      }

      const body = screensArrayMatch[1];
      // Regex targeting objects with: id, label, path, kind properties
      const itemRegex = /\{\s*id:\s*'([^']*)',\s*label:\s*'([^']*)',\s*path:\s*'([^']*)',\s*kind:\s*'([^']*)'(?:,\s*note:\s*'[^']*')?\s*\}/g;
      
      const screens = [];
      let match;
      while ((match = itemRegex.exec(body)) !== null) {
        screens.push({
          id: match[1],
          label: match[2],
          path: match[3],
          kind: match[4]
        });
      }

      if (screens.length === 0) {
        logger.warn('Screens parsed to zero. Attempting looser pattern matching.');
        // Looser parser fallback
        const lines = body.split('\n');
        for (const line of lines) {
          if (line.includes('id:') && line.includes('path:')) {
            const idM = line.match(/id:\s*'([^']*)'/);
            const labelM = line.match(/label:\s*'([^']*)'/);
            const pathM = line.match(/path:\s*'([^']*)'/);
            const kindM = line.match(/kind:\s*'([^']*)'/);
            if (idM && pathM) {
              screens.push({
                id: idM[1],
                label: labelM ? labelM[1] : idM[1],
                path: pathM[1],
                kind: kindM ? kindM[1] : 'page'
              });
            }
          }
        }
      }

      logger.info(`RouteDiscoverer: Successfully extracted ${screens.length} routes from screenRoutes.js`);
      return screens.length > 0 ? screens : this.getFallbackRoutes();

    } catch (error) {
      logger.error(`Failed to parse React routes: ${error.message}. Returning fallback routes.`);
      return this.getFallbackRoutes();
    }
  }

  static getFallbackRoutes() {
    return [
      { id: 'auth-01', label: 'Splash', path: '/splash', kind: 'auth' },
      { id: 'auth-02', label: 'Welcome / marketing', path: '/welcome', kind: 'auth' },
      { id: 'auth-03', label: 'Sign in', path: '/login', kind: 'auth' },
      { id: 'auth-04', label: 'Sign up', path: '/signup', kind: 'auth' },
      { id: 'auth-05', label: 'Forgot password', path: '/forgot-password', kind: 'auth' },
      { id: 'auth-06', label: 'Reset password', path: '/reset-password', kind: 'auth' },
      { id: 'auth-07', label: 'OTP verification', path: '/otp', kind: 'auth' },
      { id: 'app-01', label: 'Dashboard home', path: '/dashboard', kind: 'page' },
      { id: 'app-04', label: 'My surveys', path: '/surveys', kind: 'page' }
    ];
  }
}

module.exports = RouteDiscoverer;

import { AuthService } from '../services';

export function AppInitializer(authService: AuthService) {
  return () => new Promise(resolve => {
    const authenticated = document.cookie.indexOf('authenticated=true') > -1;
    if (authenticated) {
      // Attempt to refresh token on app start up to auto authenticate
      authService.refreshToken().subscribe().add(resolve(true));
    } else {
      resolve(true);
    }
  });
}

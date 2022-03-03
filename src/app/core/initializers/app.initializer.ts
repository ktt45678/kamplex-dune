import { AuthService } from '../services';

export function AppInitializer(authService: AuthService) {
  return () => new Promise(resolve => {
    if (authService.refreshTokenValue) {
      // Attempt to refresh token on app start up to auto authenticate
      authService.refreshToken().subscribe().add(resolve(true));
    } else {
      resolve(true);
    }
  });
}

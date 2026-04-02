import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // Import withInterceptors
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor'; // Import the new function

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
 
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
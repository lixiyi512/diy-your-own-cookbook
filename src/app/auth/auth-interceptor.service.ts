import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpParams
} from '@angular/common/http';
import { take, exhaustMap } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { EDAMAM_DOMAIN } from '../shared/constants';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return this.authService.user.pipe(
      take(1),
      exhaustMap(user => {
        if (!user || this.isEdamamApi(req.url)) {
          return next.handle(req);
        }
        const modifiedReq = req.clone({
          params: new HttpParams().set('auth', user.token)
        });
        return next.handle(modifiedReq);
      })
    );
  }

  private isEdamamApi(url: string): boolean {
    return this.getHostname(url).indexOf(EDAMAM_DOMAIN) > -1;
  }

  private getHostname(url: string): string {
    const temp = document.createElement('a');
    temp.href = url;
    return temp.hostname;
  }
}

import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {isPlatformBrowser} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CustomIntepretatorService implements HttpInterceptor {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (isPlatformBrowser(this.platformId)) {
    const localToken = localStorage.getItem('token');
    if (localToken) {
      req = req.clone({ headers: req.headers.set('Authorization', 'Bearer ' + localToken) });
    }
  }
  return next.handle(req);
}
}

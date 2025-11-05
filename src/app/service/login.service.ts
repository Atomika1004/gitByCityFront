import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private loginUrl = 'http://localhost:8081/api/auth/login';
  private regUrl = 'http://localhost:8081/api/registration';

  constructor(
    private http: HttpClient) {
  }

  onLogin(obj: any): Observable<any> {
    debugger
    return this.http.post(this.loginUrl, obj);
  }

  onRegistration(obj: any): Observable<any> {
    return this.http.post(this.regUrl, obj);
  }
}

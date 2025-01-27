import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class ClientService {

  private clientUrl = 'api/base/client';

  constructor(
    private http: HttpClient) { }

    public getClient(): Observable<any> {
      return this.http.get<any>(`${this.clientUrl}` + '/profile');
    }

  public getClientId(): Observable<number> {
    return this.http.get<number>(`${this.clientUrl}` + '/isLike');
  }
}

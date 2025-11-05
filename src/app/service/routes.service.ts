import { Injectable } from '@angular/core';
import {Route} from '../models/route';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class RoutesService {
  route: Route | null = null;
  private routeSource = new BehaviorSubject<Route | null>(this.route);
  currentRouteSource = this.routeSource.asObservable();


  private backUrl = 'api/base/routes';

  constructor(private http: HttpClient) { }

  changeDataForPoints(route: Route | null): void {
    this.routeSource.next(route);
  }

  getAllRoutes(): Observable<Route[]> {
    return this.http.get<Route[]> (this.backUrl).pipe();
  }

  addNewRoute(route: Route): Observable<any> {
    return this.http.post<Route> (this.backUrl, route).pipe();
  }

  deleteRoute(routeId: number | null): Observable<Route> {
    return this.http.delete<Route>(this.backUrl + '/' + routeId).pipe();
  }

  updateRoute(route: Route): Observable<any> {
    return this.http.put<Route>(this.backUrl + '/update/' + route.id, route).pipe();
  }

  getRouteOnId(routeId: number | null): Observable<Route> {
    return this.http.get<Route>(this.backUrl + '/' + routeId).pipe();
  }

  likeRoute(routeId: number | null, username: string): Observable<number> {
    // @ts-ignore
    return this.http.post(this.backUrl + '/' + routeId + '/like?clientUsername=' + username).pipe();
  }
}

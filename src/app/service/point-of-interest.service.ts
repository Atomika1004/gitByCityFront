import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {PointOfInterest} from '../models/pointOfInterest';

@Injectable({
  providedIn: 'root'
})
export class PointOfInterestService {
  private backUrl = 'api/base/points';

  private pointsSource = new BehaviorSubject<number[]>([]);
  currentPointsSource = this.pointsSource.asObservable();

  private changePoint = new BehaviorSubject<number | null >(null);
  currentChangePoint$ = this.changePoint.asObservable();


  changeDataForPoints(coords: number[]) {
    this.pointsSource.next(coords);
  }

  changeDataForChangePoint(id: number | null): void {
    this.changePoint.next(id);
  }

  constructor(private http: HttpClient) { }

  getAllPoints(): Observable<PointOfInterest[]> {
    return this.http.get<PointOfInterest[]> (this.backUrl).pipe();
  }

  addPoint(points: PointOfInterest): Observable<any> {
    return this.http.post<PointOfInterest> (this.backUrl, points).pipe();
  }

  deletePoints(pointId: number | null): Observable<PointOfInterest> {
    return this.http.delete<PointOfInterest>(this.backUrl + '/' + pointId).pipe();
  }

  updatePoint(points: PointOfInterest): Observable<any> {
    return this.http.put<PointOfInterest>(this.backUrl + '/update/' + points.id, points).pipe();
  }

  getPointOnId(pointId: number | null): Observable<PointOfInterest> {
    return this.http.get<PointOfInterest>(this.backUrl + '/' + pointId).pipe();
  }

  likePoint(pointId: number | null, username: string): Observable<number> {
    // @ts-ignore
    return this.http.post(this.backUrl + '/' + pointId + '/like?clientUsername=' + username).pipe();
  }


  // async getAllPont(): Promise<any>{
  //   return fetch(this.url, {
  //     method: 'GET'
  //   }).then(response => response.json())
  // }
  //
  // async addNewPont(pointOfInterest: PointOfInterest): Promise<any> {
  //   return fetch(this.url, {
  //     method: 'POST',
  //     body: JSON.stringify(pointOfInterest)
  //   }).then(response => response.json())
  // }
  //
  // async updatePoint(id:string, newPoint: PointOfInterest): Promise<any> {
  //   return fetch(this.url + '/' + id, {
  //     method: 'PUT',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify(newPoint)
  //   })
  // }
  //
  // async deletePoint(id: string): Promise<any> {
  //   return fetch(this.url + '/' + id, {
  //     method: 'DELETE',
  //   })
  // }

  // async getPointOfInterestOnId(id: string | undefined): Promise<any> {
  //   return fetch(this.url + '/' + id, {
  //     method: 'GET',
  //   }).then(response => response.json())
  // }


}


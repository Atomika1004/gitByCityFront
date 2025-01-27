import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Comment} from '../models/comment';

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  private backUrl = "api/base/comments";

  constructor(private http: HttpClient) { }

  getAllCommentsForRoute(routeId: number): Observable<Comment[]> {
    return this.http.get<Comment[]> (this.backUrl + '/route/' + routeId).pipe();
  }

  getAllCommentsForPoint(pointId: number): Observable<Comment[]> {
    return this.http.get<Comment[]> (this.backUrl + '/point/' + pointId).pipe();
  }

  addNewComment(comment: Comment): Observable<any> {
    return this.http.post<Comment> (this.backUrl, comment).pipe();
  }

  deleteComment(commentId: number | null): Observable<any> {
    return this.http.delete<number>(this.backUrl + '/' + commentId).pipe();
  }

  updateComment(comment: Comment): Observable<any> {
    return this.http.put<Comment>(this.backUrl + '/' + comment.id, comment).pipe();
  }
}

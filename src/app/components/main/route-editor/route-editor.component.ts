import {ChangeDetectorRef, Component, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {MapStateService} from '../../../service/map-state.service';
import {RoutesService} from '../../../service/routes.service';
import {Route} from '../../../models/route';
import {PointOfInterest} from '../../../models/pointOfInterest';
import {PointOfInterestService} from '../../../service/point-of-interest.service';
import {response} from 'express';
import {ClientService} from '../../../service/client-service';
import {Comment} from '../../../models/comment';
import {BehaviorSubject} from 'rxjs';
import {CommentService} from '../../../service/comment.service';

@Component({
  selector: 'app-route-editor',
  templateUrl: './route-editor.component.html',
  styleUrl: './route-editor.component.css'
})
export class RouteEditorComponent implements OnInit {
  map: any;
  route!: Route;
  pointsInRoute: Awaited<PointOfInterest | undefined>[] = [];
  point?: PointOfInterest;
  testDAte: number[][] = [];
  protected likes: number = 0
  currentSlide: number = 0;
  protected isLiked: boolean;

  protected addComment!: Comment;
  protected comment: string = '';
  protected clientId!: number;

  editedCommentId: number | null = null;
  editedCommentText: string = '';


  private listComments = new BehaviorSubject<Comment[]>([]);
  currentCommentList$ = this.listComments.asObservable();

  protected readonly value = signal('');

  protected onInput(event: Event) {
    this.value.set((event.target as HTMLInputElement).value);
  }

  constructor(private mapStateService: MapStateService,
              private routesService: RoutesService,
              private pointService: PointOfInterestService,
              private router: Router,
              private cdr: ChangeDetectorRef,
              private clientService: ClientService,
              private commentService: CommentService,) {
    this.isLiked = false;
  }

  async ngOnInit() {
    await ymaps.ready(() => {
      this.map = this.mapStateService.getMap();
      const id = this.router.url.slice(this.router.url.lastIndexOf('/') + 1);

      this.routesService.getRouteOnId(Number(id)).subscribe(result => {
        this.clientService.getClientId().subscribe(id => {
          this.clientId = id;
          if (result.likes) {
            result.likes.forEach(like => {
              if(like === id) {
                this.isLiked = true;
              }
            })
          }
        })
        this.commentService.getAllCommentsForRoute(Number(id)).subscribe(comments => {
          this.listComments.next(comments);
        })
        this.route = result;
        if (this.route.likes) {
          this.likes = this.route.likes.length
        }
        if (this.map) {
          this.drawRoute().then(() => this.cdr.detectChanges());
        }
      });
    });
  }


  async drawRoute() {
    let pointIds = null;
    if(this.route.pointOfInterestRoutesDto){
       pointIds = this.route.pointOfInterestRoutesDto;
      const pointObservables = pointIds.map((id) =>
        this.pointService.getPointOnId(id)
      );
      const points = await Promise.all(pointObservables.map((obs) => obs.toPromise()));
      this.pointsInRoute = points;
    }

    // @ts-ignore
    this.testDAte = this.pointsInRoute.map((point) => [point.latitude, point.longitude]);

    const routeModel = new ymaps.multiRouter.MultiRouteModel(this.testDAte, {
      routingMode: 'pedestrian',
    });

    const multiRoute = new ymaps.multiRouter.MultiRoute(routeModel, {
      boundsAutoApply: true,
      routeStrokeWidth: 6,
      routeStrokeColor: '#ff0000',
      routeActiveStrokeColor: '#8f007a',
      routeStrokeOpacity: 0.8,
      wayPointIconFillColor: '#0000ff',
      wayPointIconRadius: 6,
    });

    this.map.geoObjects.add(multiRoute);

    multiRoute.events.add('mouseenter', (event) => {
      const route = event.get('target');
      route.options.set('routeActiveStrokeColor', '#00ff00');
      route.options.set('routeStrokeWidth', 8);
    });

    multiRoute.events.add('mouseleave', (event) => {
      const route = event.get('target');
      route.options.set('routeActiveStrokeColor', '#8f007a');
      route.options.set('routeStrokeWidth', 6);
    });
  }

  like() {
    let user = localStorage.getItem("user");
    if (user) {
      this.routesService.likeRoute(this.route.id, user).subscribe(async result => {
        this.isLiked = !this.isLiked;
        this.likes = result
        this.cdr.detectChanges();
      })
    }
  }

  nextSlide() {
    if (this.route?.images) {
      this.currentSlide =
        (this.currentSlide + 1) % this.route.images.length;
    }
  }

  prevSlide() {
    if (this.route?.images) {
      this.currentSlide =
        (this.currentSlide - 1 + this.route.images.length) %
        this.route.images.length;
    }
  }

  addCommentForRoute() {
    if (this.comment.length > 0) {
      this.addComment = {
        id: null,
        clientId: null,
        routeId: this.route.id,
        pointOfInterestId: null,
        text: this.comment,
      }
      this.commentService.addNewComment(this.addComment).subscribe(res => {
        this.comment = '';
        if (this.route.id)
        this.commentService.getAllCommentsForRoute(this.route.id).subscribe(comments => {
          this.listComments.next(comments);
        })
      })
    }
  }

  editComment(comment: Comment) {
    this.editedCommentId = comment.id;
    this.editedCommentText = comment.text;
  }

  saveEditedComment(commentId: number | null) {
    if (commentId !== null) {
      const updatedComment: Comment = {
        id: commentId,
        clientId: null,
        routeId: this.route.id,
        pointOfInterestId: null,
        text: this.editedCommentText,
      };
      this.commentService.updateComment(updatedComment).subscribe(() => {
        if (this.route.id)
        this.commentService.getAllCommentsForRoute(this.route.id).subscribe(comments => {
          this.listComments.next(comments);
        });
        this.cancelEdit();
      });
    }
  }

  cancelEdit() {
    this.editedCommentId = null;
    this.editedCommentText = '';
  }

  deleteComment(id: number | null) {
    this.commentService.deleteComment(id).subscribe(res => {
      if (this.route.id)
      this.commentService.getAllCommentsForRoute(this.route.id).subscribe(comments => {
        this.listComments.next(comments);
      })
    })
  }

}

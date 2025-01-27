import {ChangeDetectorRef, Component, OnInit, signal} from '@angular/core';
import {MapStateService} from '../../../service/map-state.service';
import {PointOfInterestService} from '../../../service/point-of-interest.service';
import {PointOfInterest} from '../../../models/pointOfInterest';
import {Router} from '@angular/router';
import {ClientService} from '../../../service/client-service';
import {CommentService} from '../../../service/comment.service';
import {Comment} from '../../../models/comment';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'app-points-editor',
  templateUrl: './points-editor.component.html',
  styleUrl: './points-editor.component.css'
})
export class PointsEditorComponent implements OnInit {
   private map: any
   pointId!: number;
   pointOfInterest!: PointOfInterest;
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

  constructor(private mapStateService: MapStateService,
              private pointService: PointOfInterestService,
              private router: Router,
              private cdr: ChangeDetectorRef,
              private clientService: ClientService,
              private commentService: CommentService,) {
    this.isLiked = false;
  }

  protected readonly value = signal('');

  protected onInput(event: Event) {
    this.value.set((event.target as HTMLInputElement).value);
  }

  async ngOnInit() {
    let id = this.router.url.slice(this.router.url.lastIndexOf('/') + 1, this.router.url.length)
    this.pointId = Number(id)
    this.pointService.getPointOnId(Number(id)).subscribe( result => {
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
      this.commentService.getAllCommentsForPoint(Number(id)).subscribe(comments => {
        this.listComments.next(comments);
      })
      this.pointOfInterest = result;
      if (this.pointOfInterest.likes) {
        this.likes = this.pointOfInterest.likes.length
      }
       ymaps.ready(() => {
        this.map = this.mapStateService.getMap();
        if (this.map) {
          this.map.geoObjects.add(new ymaps.Placemark(
              [result.latitude, result.longitude],
              {
                balloonContent: `
                      <div>
                        <p>id: ${this.pointOfInterest.id}</p>
                        <p><strong>Название: ${this.pointOfInterest.name}</strong></p>
                        <p>Широта: ${this.pointOfInterest.latitude}</p>
                        <p>Долгота: ${this.pointOfInterest.longitude}</p>
                      </div>
                    `,
              },
              {
                preset: 'islands#blueDotIcon',
                balloonCloseButton: true,
              }
            )
          );
        }
      })
      })
  }

  like() {
    let user = localStorage.getItem("user");
    if (user) {
      this.pointService.likePoint(this.pointId, user).subscribe(async result => {
        this.likes = result
        this.cdr.detectChanges();
        this.isLiked = !this.isLiked;
      })
    }
  }

  nextSlide() {
    if (this.pointOfInterest?.images) {
      this.currentSlide =
        (this.currentSlide + 1) % this.pointOfInterest.images.length;
    }
  }

  prevSlide() {
    if (this.pointOfInterest?.images) {
      this.currentSlide =
        (this.currentSlide - 1 + this.pointOfInterest.images.length) %
        this.pointOfInterest.images.length;
    }
  }

  addCommentForPoint() {
    if (this.comment.length > 0) {
      this.addComment = {
        id: null,
        clientId: null,
        routeId: null,
        pointOfInterestId: this.pointId,
        text: this.comment,
      }
      this.commentService.addNewComment(this.addComment).subscribe(res => {
        this.comment = '';
        this.commentService.getAllCommentsForPoint(this.pointId).subscribe(comments => {
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
        routeId: null,
        pointOfInterestId: this.pointId,
        text: this.editedCommentText,
      };
      this.commentService.updateComment(updatedComment).subscribe(() => {
        this.commentService.getAllCommentsForPoint(this.pointId).subscribe(comments => {
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
      console.log(res);
      this.commentService.getAllCommentsForPoint(this.pointId).subscribe(comments => {
        this.listComments.next(comments);
      })
    })
  }
}

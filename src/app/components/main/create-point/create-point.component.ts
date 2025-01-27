import {Component, OnInit, signal} from '@angular/core';
import {PointOfInterestService} from '../../../service/point-of-interest.service';
import {PointOfInterest} from '../../../models/pointOfInterest';
import {Router} from '@angular/router';
import {MapStateService} from '../../../service/map-state.service';

@Component({
  selector: 'app-create-point',
  templateUrl: './create-point.component.html',
  styleUrl: './create-point.component.css'
})
export class CreatePointComponent implements OnInit {
  pointDescription: string = '';
  pointName: string = '';
  files: string[] = [];
  pointOfInterest!: PointOfInterest
  base64textString:string[] = [];
  coords: number[] = [];
  map: any
  idForChangePoint?: number | null;
  changePoint?: PointOfInterest;

  protected readonly value = signal('');

  protected onInput(event: Event) {
    this.value.set((event.target as HTMLInputElement).value);
  }
  constructor(protected pointService: PointOfInterestService,
              private router: Router,
              private mapStateService: MapStateService, ) {
  }

  async ngOnInit(): Promise<void> {
    this.pointService.currentPointsSource.subscribe(date => this.coords = date)
    await ymaps.ready(async () => {
      this.map = this.mapStateService.getMap();
        if (this.map) {
          this.pointService.currentChangePoint$.subscribe(res => {
            this.idForChangePoint = res;
          })
            if (this.idForChangePoint) {
              this.pointService.getPointOnId(this.idForChangePoint).subscribe(res => {
                  this.changePoint = res;
                  this.pointName = this.changePoint.name
                  this.pointDescription = this.changePoint.description
                  this.map.geoObjects.add(this.drawPlacemark([this.changePoint.latitude, this.changePoint.longitude], 'В процессе редактирования'));

              })
            }
          else {
            this.map.geoObjects.add(this.drawPlacemark(this.coords, 'В процессе создания'));
          }
        }
    });
  }

  savePoint() {
    if (!this.pointName.trim()) {
      alert('Название должно быть заполнено');
      return;
    }
    if (this.changePoint) {
      this.pointOfInterest = {
        id: this.changePoint.id,
        name: this.pointName,
        clientId: this.changePoint.clientId,
        likes: this.changePoint.likes,
        description: this.pointDescription,
        images: this.base64textString,
        latitude: this.coords[0],
        longitude: this.coords[1],
      };
      this.pointService.updatePoint(this.pointOfInterest).subscribe(res => {
        if (res.success) {
          alert(res.message);
          this.router.navigate(["/main/points"]);
        } else {
          alert(res.message);
        }
      })
    }
    else {
      this.pointOfInterest = {
        id: null,
        name: this.pointName,
        description: this.pointDescription,
        clientId: null,
        likes: null,
        images: this.base64textString,
        latitude: this.coords[0],
        longitude: this.coords[1],
      };
      if (this.pointOfInterest) {
        this.pointService.addPoint(this.pointOfInterest).subscribe(res => {
          if (res.success) {
            alert(res.message);
            this.router.navigate(["/main/points"]);
          } else {
            alert(res.message);
          }
        })
      }
      else {
        alert("Введите значения!!!!!!!!!!")
      }
    }
    this.pointService.changeDataForChangePoint(null)
  }

  saveFiles(event: any): void {
    const selectedFiles = event.target.files;
    const selectedFiles1 = event.target.files[0];
    const reader = new FileReader();
    reader.onload = this.handleReaderLoaded.bind(this);
    reader.readAsBinaryString(selectedFiles1);
    for (let i = 0; i < selectedFiles.length; i++) {
      this.files.push(selectedFiles1[i]);
    }
  }

  handleReaderLoaded(e: any) {
    this.base64textString.push('data:image/png;base64,' + btoa(e.target.result));
  }

  drawPlacemark(coord: number[], text: string) {
    const placemark = new ymaps.Placemark(
      coord,
      {
        balloonContent: `
        <div>
          <p>${text}</p>
        </div>
      `,
      },
      {
        preset: 'islands#blueDotIcon',
        balloonCloseButton: true,
        draggable: true,
      }
    );

    placemark.events.add('dragend', (e: any) => {
      if (placemark.geometry){
      const newCoords = placemark.geometry.getCoordinates();
      if (newCoords)
      this.coords = newCoords;
      }
    });
    return placemark;
  }
}

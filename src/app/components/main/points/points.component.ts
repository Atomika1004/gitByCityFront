import {Component,OnInit} from '@angular/core';
import {MapStateService} from '../../../service/map-state.service';
import {Router} from '@angular/router';
import {PointOfInterestService} from '../../../service/point-of-interest.service';
import {PointOfInterest} from '../../../models/pointOfInterest';
import {BehaviorSubject} from 'rxjs';
import {ClientService} from '../../../service/client-service';

@Component({
  selector: 'app-points',
  templateUrl: './points.component.html',
  styleUrl: './points.component.css'
})
export class PointsComponent implements OnInit{
  id: number = 0;
  clientId!: number;

  private listPoints = new BehaviorSubject<PointOfInterest[]>([]);
  currentListPoints$ = this.listPoints.asObservable();



  pointService: PointOfInterestService;

  map: any
  pointsOfInterest: PointOfInterest[] = []

  constructor(private mapStateService: MapStateService,
              private router: Router,
              private pointsService: PointOfInterestService,
              private clientService: ClientService) {
    this.pointService = pointsService;
  }

  async ngOnInit() {
    let map = null;

    await ymaps.ready(async () => {
      this.pointsService.getAllPoints().subscribe(res => {
        Number(this.clientService.getClientId().subscribe(res => this.clientId = res));
        this.listPoints.next(res);
        this.drawPoint();
      })
      console.log('startmap');
      this.map = this.mapStateService.getMap();
      if (this.map) {
        this.map.events.add('contextmenu', (e: any) => {
          this.showContextMenu(e);
        });
      }

    });
  }

  showContextMenu(e: any): void {
    const coords = e.get('coords');
    const pageCoords = e.get('pagePixels');

    console.log('Контекстное меню для координат:', coords);

    const menu = document.createElement('div');
    menu.style.position = 'absolute';
    menu.style.backgroundColor = '#527def';
    menu.style.color = '#ffffff';
    menu.style.border = '1px solid #ccc';
    menu.style.padding = '10px';
    menu.style.zIndex = '1000';
    menu.style.cursor = 'pointer';
    menu.innerText = 'Добавить точку';
    menu.style.borderRadius = '10px';

    menu.style.left = `${pageCoords[0]}px`;
    menu.style.top = `${pageCoords[1]}px`;

    document.body.appendChild(menu);

    menu.onclick = () => {
      console.log('Добавлена точка:', coords);
      this.pointsService.changeDataForPoints(coords);
      this.router.navigate(["/main/points/create"]);
      document.body.removeChild(menu);
    };


    document.addEventListener(
      'click',
      () => {
        if (document.body.contains(menu)) {
          document.body.removeChild(menu);
        }
      },
      { once: true }
    );
  }

  async drawPoint() {
    this.pointsService.getAllPoints().subscribe(res => {
      this.pointsOfInterest = res;
      for (let i = 0; i < this.pointsOfInterest.length; i++) {
        const isCreator = this.clientId === Number(this.pointsOfInterest[i].clientId);
        const point = this.pointsOfInterest[i];
        const placemark = new ymaps.Placemark(
          [point.latitude, point.longitude],
          {
            balloonContent: isCreator ? `
          <div>
            <p><strong>Название: ${point.name}</strong></p>
            <p>Широта: ${point.latitude}</p>
            <p>Долгота: ${point.longitude}</p>
            <button id="deleteButton-${point.id}" style="padding: 5px; background: red; color: white; border: none; cursor: pointer; border-radius: 5px;">
              Удалить точку
            </button>
            <button id="updateButton-${point.id}" style="padding: 5px; background: blue; color: white; border: none; cursor: pointer; border-radius: 5px;">
              Изменить точку
            </button>
          </div>
        ` : `
          <div>
            <p><strong>Название: ${point.name}</strong></p>
            <p>Широта: ${point.latitude}</p>
            <p>Долгота: ${point.longitude}</p>
          </div>
        `,
            iconContent: isCreator ? 'W' : ''
          },
          {
            preset: isCreator ? 'islands#orangeCircleIcon' : 'islands#blueDotIcon',
            balloonCloseButton: true,
          }
        );

        this.map.geoObjects.add(placemark);

        if (isCreator) {
          placemark.events.add('balloonopen', () => {
            const deleteButton = document.getElementById(`deleteButton-${point.id}`);
            const updateButton = document.getElementById(`updateButton-${point.id}`);
            if (deleteButton && updateButton) {
              deleteButton.addEventListener('click', () => this.removePoint((point.id)));
              updateButton.addEventListener('click', () => this.updateButton((point.id)));
            }
          });
        }
      }
    })
  }

  removePoint(id: number| null): void {
    this.pointsService.deletePoints(id).subscribe(async res => {
      this.map.geoObjects.removeAll()
      await this.drawPoint()
      this.pointsService.getAllPoints().subscribe(res => {
        this.listPoints.next(res);
      })
    });
  }

  updateButton(id: number | null): void {
    this.pointsService.changeDataForChangePoint(id)
    this.router.navigate(["/main/points/create"]);
  }
}

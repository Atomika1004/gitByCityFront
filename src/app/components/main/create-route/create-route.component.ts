import {ChangeDetectorRef, Component, EventEmitter, OnInit, Output, signal} from '@angular/core';
import {MapStateService} from '../../../service/map-state.service';
import {PointOfInterest} from '../../../models/pointOfInterest';
import {PointOfInterestService} from '../../../service/point-of-interest.service';
import {Route} from '../../../models/route';
import {RoutesService} from '../../../service/routes.service';
import {Router} from '@angular/router';



export interface PointsInRoute {
  point: PointOfInterest,
  position: number
}


@Component({
  selector: 'app-create-route',
  templateUrl: './create-route.component.html',
  styleUrl: './create-route.component.css'
})
export class CreateRouteComponent implements OnInit{
  @Output() outRouteName = new EventEmitter<string>();

  private placemarks: { id: number | null, mark: any }[] = [];

  multiRoute: any

  points: any[] = [];

  pointsListInRoute: PointsInRoute[] = [];

  map: any;

  route!: Route;

  changeRoute!: Route | null;

  routeName: string = '';
  routeDescription: string = '';
  files: File[] = [];
  base64textString:string[] = [];

  testDAte: number[][] = []
  testDate2: number[][][] = []

  listId: number[] = [];

  protected readonly value = signal('');

  protected onInput(event: Event) {
    this.value.set((event.target as HTMLInputElement).value);
  }


  constructor(private mapStateService: MapStateService,
              private cdr: ChangeDetectorRef,
              private pointService: PointOfInterestService,
              protected routeService: RoutesService,
              private router: Router) {
  }

  async ngOnInit() {
    await ymaps.ready(async () => {
      this.map = this.mapStateService.getMap();
      if (this.map) {
        await this.drawPoint();
        this.routeService.currentRouteSource.subscribe(async (route) => {
          this.changeRoute = route;
          if (this.changeRoute) {
            await this.drawRouteFromChangeRoute(this.changeRoute);
          }
        });
      }
    });
  }


  async drawPoint() {
    this.pointService.getAllPoints().subscribe(res => {
      this.points = res
      for (let i = 0; i < this.points.length; i++) {
        const point = this.points[i];
        const placemark = this.createPlasmark(point)
        this.map.geoObjects.add(placemark);
        placemark.events.add('balloonopen', () => {
          const addButton = document.getElementById(`addButton-${point.id}`);
          if (addButton) {
            addButton.addEventListener('click', () => this.addPointInRoute(point.id, placemark) )
          }
        });
      }
    });

  }

  async addPointInRoute(id: number | null, placemark: any) {
    let point: PointOfInterest | null = null
      if (id !== null) {}
      this.pointService.getPointOnId(id).subscribe(async res => {
        point = res
        this.pointsListInRoute.push({point: point, position: this.pointsListInRoute.length + 1});

        await this.updatePositions();

        if (this.map) {
          this.map.geoObjects.remove(placemark);
        }

        if (point) {
          const mark = new ymaps.Placemark(
            [point.latitude, point.longitude],
            {
              balloonContent: `
                <div>
                  <p><strong>Координаты:</strong></p>
                  <p>Широта: ${point.latitude}</p>
                  <p>Долгота: ${point.longitude}</p>
                  <button id="deleteButton-${point.id}" style="padding: 5px; background: red; color: white; border: none; cursor: pointer; border-radius: 5px;">
                    Удалить точку
                  </button>
                </div>
              `,
              iconContent: `${this.pointsListInRoute.find(p => p.point.id === id)?.position}`,
            },
            {
              preset: 'islands#blackCircleIcon',
              balloonCloseButton: true,
            }
          );
          if (this.map) {
            this.map.geoObjects.add(mark);
          }
          mark.events.add('balloonopen', () => {
            const deleteButton = document.getElementById(`deleteButton-${res.id}`);
            if (deleteButton) {
              deleteButton.addEventListener('click', () => this.removePoint(res.id, mark));
            }
          });

          this.placemarks.push({id: point.id, mark: mark});
        }
        this.cdr.detectChanges();
      });



  }


  async removePoint(id: number | null, mark: any): Promise<void> {
    if (id)
    this.pointService.getPointOnId(id).subscribe(async res => {
      let point = res
      const index = this.placemarks.findIndex(p => p.id === point.id);

      const pointIndex = this.pointsListInRoute.findIndex(point => point.point.id === id);

      if (pointIndex !== -1) {
        this.pointsListInRoute.splice(pointIndex, 1);


        this.placemarks.splice(index, 1);

        await this.updatePositions();

        this.cdr.detectChanges();

        this.map.geoObjects.remove(mark);


        const oldMark = this.createPlasmark(point)

        this.map.geoObjects.add(oldMark);

        oldMark.events.add('balloonopen', () => {
          const addButton = document.getElementById(`addButton-${point.id}`);
          if (addButton) {
            if (res.id) {
              addButton.addEventListener('click', () => this.addPointInRoute(res.id, oldMark));
            }

          }
        });
      }
    })

  }


  private async updatePositions(): Promise<void> {
    this.pointsListInRoute.forEach((pointInRoute, index) => {
      pointInRoute.position = index + 1;
    });

    this.pointsListInRoute.forEach((pointInRoute) => {
      const placemark = this.placemarks.find(p => p.id === pointInRoute.point.id)?.mark;

      if (placemark) {
        placemark.properties.set('iconContent', `${pointInRoute.position}`);
        placemark.properties.set('balloonContent', `
        <div>
          <p><strong>Позиция:</strong> ${pointInRoute.position}</p>
          <p><strong>Название:</strong> ${pointInRoute.point.name}</p>
          <p><strong>Широта:</strong> ${pointInRoute.point.latitude}</p>
          <p><strong>Долгота:</strong> ${pointInRoute.point.longitude}</p>
          <button id="deleteButton-${pointInRoute.point.id}" style="padding: 5px; background: red; color: white; border: none; cursor: pointer; border-radius: 5px;">
            Удалить точку
          </button>
        </div>
      `);
      }
    });
    await this.drawDynamicRoute()
  }

  async drawDynamicRoute(): Promise<void> {
    if (this.map) {
      this.map.geoObjects.remove(this.multiRoute);
    }
    this.multiRoute = null;
    this.testDate2 = []
    this.testDAte = []
    if (this.pointsListInRoute.length > 1) {
      let coords
      for (let i = 0; i < this.pointsListInRoute.length; i++) {
        let pointInRoute = this.pointsListInRoute[i].point;
        coords = [pointInRoute.latitude, pointInRoute.longitude];
        this.testDAte.push(coords);
      }
      this.testDate2.push(this.testDAte);


      this.testDate2.forEach((routePoints) => {
        const routeModel = new ymaps.multiRouter.MultiRouteModel(routePoints, {
          routingMode: 'pedestrian',
        });

        this.multiRoute = new ymaps.multiRouter.MultiRoute(routeModel, {
          //boundsAutoApply: true,
          routeStrokeWidth: 6, // Толщина линий маршрута
          routeStrokeColor: '#ff0000', // Цвет линий маршрута
          routeActiveStrokeColor: '#8f007a', // Цвет активного маршрута
          routeStrokeOpacity: 0.8, // Прозрачность линий
          wayPointVisible: false,
          viaPointVisible: false,
        });
        if (this.map) {
          this.map.geoObjects.add(this.multiRoute);
        }
        this.multiRoute.events.add('mouseenter', (event:any) => {
          const route = event.get('target');
          route.options.set('routeActiveStrokeColor', '#00ff00');
          route.options.set('routeStrokeWidth', 8);
        });

        this.multiRoute.events.add('mouseleave', (event: any) => {
          const route = event.get('target');
          route.options.set('routeActiveStrokeColor', '#8f007a');
          route.options.set('routeStrokeWidth', 6);
        });
      });
    }
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

  async saveRoute(): Promise<void> {
    if (!this.routeName.trim()) {
      alert('Название должно быть заполнено');
      return;
    }
    if (this.pointsListInRoute.length < 2) {
      alert('Маршрут должен состоять минимум из 2 точек');
      return;
    }
   for (let i = 0; i < this.pointsListInRoute.length; i++) {
     if (this.listId.length > 0) {
       let ib: boolean = !!this.listId.find(p => p === this.pointsListInRoute[i].point.id);
       if (!ib) {
         this.listId.push(<number>this.pointsListInRoute[i].point.id)
       }
     }else {
       this.listId.push(<number>this.pointsListInRoute[i].point.id)
     }
   }
   console.log(this.listId);
   if (this.changeRoute) {
     this.route = {
       id: this.changeRoute.id,
       name: this.routeName,
       clientId: this.changeRoute.clientId,
       likes: this.changeRoute.likes,
       description: this.routeDescription,
       images: this.base64textString,
       pointOfInterestRoutesDto: this.listId
     };
      this.routeService.updateRoute(this.route).subscribe(res => {
        if (res.success) {
          alert(res.message);
          this.router.navigate(["/main/routes"]);
          this.routeService.changeDataForPoints(null)
        } else {
          alert(res.message);
        }
      })
   }else {
     this.route = {
       id: null,
       name: this.routeName,
       description: this.routeDescription,
       clientId: null,
       likes: null,
       images: this.base64textString,
       pointOfInterestRoutesDto: this.listId
     };
      this.routeService.addNewRoute(this.route).subscribe(res => {
        if (res.success) {
          alert(res.message);
          this.router.navigate(["/main/routes"]);
          this.routeService.changeDataForPoints(null)
        } else {
          alert(res.message);
        }
      })
   }
  }

  createPlasmark(point: PointOfInterest): any {
    return new ymaps.Placemark(
      [point.latitude, point.longitude],
    {
      balloonContent: `
          <div>
            <p>id: ${point.id}</p>
            <p><strong>Название: ${point.name}</strong></p>
            <p>Широта: ${point.latitude}</p>
            <p>Долгота: ${point.longitude}</p>
            <button id="deleteButton-${point.id}" style="padding: 5px; background: red; color: white; border: none; cursor: pointer; border-radius: 5px;">
              Удалить точку
            </button>

            <button id="addButton-${point.id}" (click)="addPoints()" style="padding: 5px; background: blue; color: white; border: none; cursor: pointer; border-radius: 5px;">
              Добавить точку
            </button>
          </div>
        `,
    },
    {
      preset: 'islands#blueDotIcon',
        balloonCloseButton: true,
    })
    }

  async drawRouteFromChangeRoute(route: Route): Promise<void> {
    this.pointsListInRoute = [];
    this.routeName = route.name;
    this.routeDescription = route.description;
    for (const pointId of route.pointOfInterestRoutesDto) {
      this.pointService.getPointOnId(pointId).subscribe(async res => {
        const placemark = this.createPlasmark(res);
        if (res.id)  {
          await this.addPointInRoute(res.id, placemark);
        }
      });
    }
    this.cdr.detectChanges();
  }
}

import {Component, NgIterable, OnInit} from '@angular/core';
import {MapStateService} from '../../../service/map-state.service';
import {Router} from '@angular/router';
import {Route} from '../../../models/route';
import {RoutesService} from '../../../service/routes.service';
import {PointOfInterestService} from '../../../service/point-of-interest.service';
import {BehaviorSubject} from 'rxjs';
import {ClientService} from '../../../service/client-service';
@Component({
  selector: 'app-routes',
  templateUrl: './routes.component.html',
  styleUrl: './routes.component.css'
})
export class RoutesComponent implements OnInit {
  private listRoutes = new BehaviorSubject<Route[]>([]);
  currentRoutesList$ = this.listRoutes.asObservable();

  routesService: RoutesService;
  map: any;
  routes: Route[] = [];
  clientId!: number
  testDAte: number[][] = []
  testDate2: number[][][] = []


  constructor(private mapStateService: MapStateService,
              private router: Router,
              private routeService: RoutesService,
              private pointService: PointOfInterestService,
              private clientService: ClientService) {
    this.routesService = routeService;
  }


  async ngOnInit() {
    await ymaps.ready(async () => {
      this.map = this.mapStateService.getMap();
      this.routesService.getAllRoutes().subscribe(res => {
        this.clientService.getClientId().subscribe(res => this.clientId = res);
        this.listRoutes.next(res);
        console.log(res);
      });
      if (this.map) {
        this.map.events.add('contextmenu', (e: any) => {
          this.showContextMenu(e);
        });
      }
      await this.drawRoutes1(this.map);
    });
  }

  async drawRoutes(map: any) {
    console.log('drawRoutes');
    this.routesService.getAllRoutes().subscribe(async (res) => {
      this.routes = res;
      const routePromises = this.routes.map(async (route) => {
        const pointPromises = route.pointOfInterestRoutesDto.map((pointId) =>
          this.pointService.getPointOnId(pointId).toPromise()
        );

        const points = await Promise.all(pointPromises);
        // @ts-ignore
        return points.map((point) => [point.latitude, point.longitude]);
      });

      this.testDate2 = await Promise.all(routePromises);

      this.testDate2.forEach((routePoints, routeIndex) => {
        const routeModel = new ymaps.multiRouter.MultiRouteModel(routePoints, {
          routingMode: 'pedestrian',
        });

        const multiRoute = new ymaps.multiRouter.MultiRoute(routeModel, {
          routeStrokeWidth: 6,
          routeStrokeColor: '#ff0000',
          routeActiveStrokeColor: '#8f007a',
          routeStrokeOpacity: 0.8,
          wayPointIconFillColor: '#0000ff',
          wayPointIconRadius: 6,
          hasBalloon: false,
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

        multiRoute.events.add('contextmenu', (event) => {
          const pageCoords = event.get('pagePixels');
          const menu = document.createElement('div');
          menu.style.position = 'absolute';
          menu.style.backgroundColor = '#527def';
          menu.style.color = '#ffffff';
          menu.style.border = '1px solid #ccc';
          menu.style.padding = '10px';
          menu.style.zIndex = '1000';
          menu.style.cursor = 'pointer';
          menu.innerText = 'Удалить маршрут';
          menu.style.borderRadius = '10px';

          menu.style.left = `${pageCoords[0]}px`;
          menu.style.top = `${pageCoords[1] + 40}px`;

          document.body.appendChild(menu);
          menu.onclick = async () => {
            this.routesService.deleteRoute(this.routes[routeIndex].id).subscribe(res => {
              map.geoObjects.remove(multiRoute);
              this.routesService.getAllRoutes().subscribe((res) => {
                this.listRoutes.next(res);
              });
            });
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
        });

      multiRoute.events.add('contextmenu', (event) => {
        const pageCoords = event.get('pagePixels');
        const menu = document.createElement('div');
        menu.style.position = 'absolute';
        menu.style.backgroundColor = '#527def';
        menu.style.color = '#ffffff';
        menu.style.border = '1px solid #ccc';
        menu.style.padding = '10px';
        menu.style.zIndex = '1000';
        menu.style.cursor = 'pointer';
        menu.innerText = 'Редактировать маршрут';
        menu.style.borderRadius = '10px';

        menu.style.left = `${pageCoords[0]}px`;
        menu.style.top = `${pageCoords[1] + 80}px`;

        document.body.appendChild(menu);
        menu.onclick = async () => {
          this.routesService.changeDataForPoints(this.routes[routeIndex])
          await this.router.navigate(["/main/routes/create"]);
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
      });
    });
      });
    }

  async drawRoutes1(map: any) {
    console.log('drawRoutes');
    this.routesService.getAllRoutes().subscribe(async (res) => {
      this.routes = res;

      const routePromises = this.routes.map(async (route) => {
        const pointPromises = route.pointOfInterestRoutesDto.map((pointId) =>
          this.pointService.getPointOnId(pointId).toPromise()
        );

        const points = await Promise.all(pointPromises);
        // @ts-ignore
        return points.map((point) => [point.latitude, point.longitude]);
      });

      this.testDate2 = await Promise.all(routePromises);

      this.testDate2.forEach((routePoints, routeIndex) => {
        const isCreator = this.routes[routeIndex].clientId === this.clientId;

        const routeModel = new ymaps.multiRouter.MultiRouteModel(routePoints, {
          routingMode: 'pedestrian',
        });

        const multiRoute = new ymaps.multiRouter.MultiRoute(routeModel, {
          routeStrokeWidth: 6,
          routeStrokeColor: isCreator ? '#ff5900' : '#0000ff', // Красный для владельца, синий для других
          routeActiveStrokeColor: isCreator ? '#ff5900' : '#0900ff', // Цвет при наведении
          routeStrokeOpacity: 0.8,
          wayPointIconFillColor: '#0000ff',
          wayPointIconRadius: 6,
          hasBalloon: false,
        });

        this.map.geoObjects.add(multiRoute);

        // Изменение ширины и цвета маршрута при наведении
        multiRoute.events.add('mouseenter', (event) => {
          const route = event.get('target');
          route.options.set('routeActiveStrokeColor', isCreator ? '#0900ff' : '#ff8800');
          route.options.set('routeStrokeWidth', 8);
        });

        multiRoute.events.add('mouseleave', (event) => {
          const route = event.get('target');
          route.options.set('routeActiveStrokeColor', isCreator ? '#ff5900' : '#00ff00');
          route.options.set('routeStrokeWidth', 6);
        });

        // Контекстное меню для владельца маршрута
        if (isCreator) {
          multiRoute.events.add('contextmenu', (event) => {
            const pageCoords = event.get('pagePixels');

            // Удаление маршрута
            const deleteMenu = document.createElement('div');
            deleteMenu.style.position = 'absolute';
            deleteMenu.style.backgroundColor = '#527def';
            deleteMenu.style.color = '#ffffff';
            deleteMenu.style.border = '1px solid #ccc';
            deleteMenu.style.padding = '10px';
            deleteMenu.style.zIndex = '1000';
            deleteMenu.style.cursor = 'pointer';
            deleteMenu.innerText = 'Удалить маршрут';
            deleteMenu.style.borderRadius = '10px';

            deleteMenu.style.left = `${pageCoords[0]}px`;
            deleteMenu.style.top = `${pageCoords[1] + 40}px`;

            document.body.appendChild(deleteMenu);

            deleteMenu.onclick = () => {
              this.routesService.deleteRoute(this.routes[routeIndex].id).subscribe((res) => {
                map.geoObjects.remove(multiRoute);
                this.routesService.getAllRoutes().subscribe((updatedRoutes) => {
                  this.listRoutes.next(updatedRoutes);
                });
              });
              document.body.removeChild(deleteMenu);
            };

            // Убираем меню при клике вне его
            document.addEventListener(
              'click',
              () => {
                if (document.body.contains(deleteMenu)) {
                  document.body.removeChild(deleteMenu);
                }
              },
              { once: true }
            );

            // Редактирование маршрута
            const editMenu = document.createElement('div');
            editMenu.style.position = 'absolute';
            editMenu.style.backgroundColor = '#527def';
            editMenu.style.color = '#ffffff';
            editMenu.style.border = '1px solid #ccc';
            editMenu.style.padding = '10px';
            editMenu.style.zIndex = '1000';
            editMenu.style.cursor = 'pointer';
            editMenu.innerText = 'Редактировать маршрут';
            editMenu.style.borderRadius = '10px';

            editMenu.style.left = `${pageCoords[0]}px`;
            editMenu.style.top = `${pageCoords[1] + 80}px`;

            document.body.appendChild(editMenu);

            editMenu.onclick = async () => {
              this.routesService.changeDataForPoints(this.routes[routeIndex]);
              await this.router.navigate(["/main/routes/create"]);
              document.body.removeChild(editMenu);
            };

            document.addEventListener(
              'click',
              () => {
                if (document.body.contains(editMenu)) {
                  document.body.removeChild(editMenu);
                }
              },
              { once: true }
            );
          });
        }
      });
    });
  }


  showContextMenu(e: any): void {
    const coords = e.get('coords');
    const pageCoords = e.get('pagePixels');

    const menu = document.createElement('div');
    menu.style.position = 'absolute';
    menu.style.backgroundColor = '#527def';
    menu.style.color = '#ffffff';
    menu.style.border = '1px solid #ccc';
    menu.style.padding = '10px';
    menu.style.zIndex = '1000';
    menu.style.cursor = 'pointer';
    menu.innerText = `Создать маршрут`;
    menu.style.borderRadius = '10px';

    menu.style.left = `${pageCoords[0]}px`;
    menu.style.top = `${pageCoords[1]}px`;

    document.body.appendChild(menu);

    menu.onclick = () => {
      this.router.navigate(["/main/routes/create"]);
      document.body.removeChild(menu);
    };

    document.addEventListener('click', () => {
        if (document.body.contains(menu)) {
          document.body.removeChild(menu);
        }
      },
      { once: true }
    );
  }
}

import {ChangeDetectorRef, Component, ElementRef, OnInit, TrackByFunction, ViewChild} from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { event } from 'jquery';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

interface Point {
  latitude: number;
  longitude: number;
}
type Route = Point[][];
type Routes = Route[];

@Component({
  selector: 'app-yandex-map',
  templateUrl: './yandex-map.component.html',
  styleUrls: ['./yandex-map.component.css'],
})

export class YandexMapComponent implements OnInit {
  @ViewChild('newItemInput') newItemInput!: ElementRef;
  @ViewChild('dynamicList') dynamicList!: ElementRef;

  private map: any; //карта
  private multiRoute: any; //обьект самого маршурта
  private referencePoints: any; // точки маршрута
  private referencePoints1: any; // точки маршрута
  public startEditing = false; //слайдер
  public startRedactor: boolean = false;
  private adres: string[]; // список улиц
  private multiRouteModel: any; //модель маршурта

  private multiPointsRoute: any; // действующий массив с точками всех статических маршрутов

  private markersList: any[] = [];

  private clickOnMap: any; //ссылка на обьект обработчика кликов
  private clickOnMap1: any; //ссылка на обьект обработчика кликов

  public addressList: string[];
  public address: string = '';


  constructor(private cdr: ChangeDetectorRef) {
    this.adres = [];
    this.addressList = [];
    this.referencePoints1 = [];
  }

  ngOnInit(): void {
    ymaps.ready(() => this.initMap());
  }

  initMap() {
    // КАРТА!
    this.map = new ymaps.Map('map', {
      center: [55.751574, 37.573856],
      zoom: 12,
      controls: ['zoomControl', 'searchControl', 'typeSelector', 'fullscreenControl', 'routeButtonControl']
    });


    //Тестовый маршут
    this.referencePoints = [
      [55.751574, 37.573856],
      [55.751999, 37.580000],
      [55.760000, 37.590000],
    ];

    this.multiPointsRoute = [
     [
        [55.751244, 37.618423],
        [55.752023, 37.617499],
        [55.750610, 37.615560]
     ],
     [
        [55.753215, 37.622504],
        [55.754814, 37.613434],
        [55.755836, 37.615171]
     ],
     [
        [55.749103, 37.539962],
        [55.747569, 37.552202],
        [55.756363, 37.547161]
     ]
  ];

    //стандартные маршруты
    // const routes: Routes = [
    //   [
    //     { latitude: 55.751244, longitude: 37.618423 }, // Красная площадь
    //     { latitude: 55.752023, longitude: 37.617499 }, // Храм Василия Блаженного
    //     { latitude: 55.750610, longitude: 37.615560 }, // ГУМ
    //   ],
    //   [
    //     { latitude: 55.753215, longitude: 37.622504 }, // Александровский сад
    //     { latitude: 55.754814, longitude: 37.613434 }, // Манежная площадь
    //     { latitude: 55.755836, longitude: 37.615171 }, // Могила Неизвестного Солдата
    //   ],
    //   [
    //     { latitude: 55.749103, longitude: 37.539962 },
    //     { latitude: 55.747569, longitude: 37.552202 },
    //     { latitude: 55.756363, longitude: 37.547161 },
    //   ],
    // ];

    this.multiPointsRoute.forEach((routePoints : any, index1: any) => {
      const routeModel = new ymaps.multiRouter.MultiRouteModel(this.multiPointsRoute[index1], {
        routingMode: 'masstransit',
      });

      const multiRoute = new ymaps.multiRouter.MultiRoute(routeModel, {
        boundsAutoApply: false,
        routeStrokeWidth: 6,
        routeStrokeColor: "#17f609",
        //strokeColor: "#333333",

      },);

      //this.multiRouteModel.push(routeModel);
      //this.multiRoute.push(multiRoute);
      this.map.geoObjects.add(multiRoute);
    });
  }




  toggleEditor() {
    if (this.multiRoute) {
      if (this.startEditing) {
        console.log(this.multiRouteModel.getReferencePoints());
        console.log('Режим добавления маршрута включён.');
        //this.multiRoute.editor.start({editWayPoints: true, removeWayPoints: true});
        // Обработчик кликов по карте
        this.clickOnMap = (e: any) => {

          console.log('Привет мир');

          const coords = e.get('coords'); // Координаты точки
          console.log('Координаты добавленной точки:', coords);

          // Добавляем точку в массив маршрута
          this.referencePoints.push(coords);

          // Обновляем маршрут
          this.updateRoute();

          // Получаем адрес новой точки
          ymaps.geocode(coords).then((res: any) => {
            const firstGeoObject = res.geoObjects.get(0);
            if (firstGeoObject) {
              const address = firstGeoObject.getAddressLine();
              //this.addressList.push(address);
              console.log('Адрес новой точки:', address);
              //this.adres.push(address);
            } else {
              console.warn('Не удалось определить адрес новой точки');
            }
          });
        };
        this.map.events.add('click', this.clickOnMap);
      } else {
        console.log('Режим добавления маршрута отключён.');
        // Удаляем обработчик кликов по карте
        this.map.events.remove('click', this.clickOnMap);
        this.multiRoute.editor.stop();
        this.startEditing = false;
      }
    }
  }

  updateRoute() {
    if (this.multiRoute) {
      this.map.geoObjects.remove(this.multiRoute);

      const multiRouteModel = new ymaps.multiRouter.MultiRouteModel(this.referencePoints, {
        routingMode: 'auto',
      });
      this.multiRoute = new ymaps.multiRouter.MultiRoute(multiRouteModel, {
        boundsAutoApply: true,
      });

      this.map.geoObjects.add(this.multiRoute);
    }
  }

  toggleRedactor() {

    let markerCounter = 1;

    if (this.startRedactor) {
      this.clickOnMap1 = (e: any) => {
        const coords1 = e.get('coords'); // Координаты точки
        this.referencePoints1.push(coords1);

        ymaps.geocode(coords1).then((res: any) => {
          const firstGeoObject = res.geoObjects.get(0);
          const newIndex = this.addressList.length;

          this.addressList.push('');
          //this.cdr.detectChanges();

          if (firstGeoObject) {
            const addresss = firstGeoObject.getAddressLine();
            this.addressList[newIndex] = addresss; // Обновляем адрес
            this.cdr.detectChanges();
          } else {
            console.warn('Не удалось определить адрес новой точки');
          }
        });
        this.markersList.push(new ymaps.Placemark(
          coords1,
          {
            balloonContentHeader: ` <input style="font-size: small" matInput placeholder="Введите название" <br>`,
            balloonContentBody: `Содержимое метки №${this.markersList.length + 1}`,
            balloonContentFooter: "Подвал",
            hintContent: `Метка №${this.markersList.length + 1}`,
            iconContent: `${this.markersList.length + 1}`,
          },
          {

            preset: "islands#redCircleIcon",
            //iconColor: "#1E90FF",
            draggable: true
          }
        ))

        // Метки
        this.map.geoObjects.add(this.markersList[this.markersList.length - 1]);

        markerCounter++;
      };
      this.map.events.add("click", this.clickOnMap1);
    } else {
      this.map.events.remove("click", this.clickOnMap1);
      this.startRedactor = false;
    }
  }

  removeAddress(i: number) {
    this.addressList.splice(i, 1);
    //
    this.map.geoObjects.remove(this.markersList[i]);
    this.markersList.splice(i, 1);
    this.updateMarkerNumber();
  }

  trackByIndex(index: number, item: any): any {
    return index; // или item.id, если у каждого элемента есть уникальный идентификатор
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.addressList, event.previousIndex, event.currentIndex);
  }

  updateMarkerNumber1() {

    this.markersList.forEach((marker, index) => {
      marker.iconContent = (index + 1).toString();
      console.log(index);
    });
  }

  updateMarkerNumber() {
    // Сначала удаляем все маркеры с карты
    this.map.geoObjects.removeAll();

    // Перебираем обновленный список маркеров
    this.markersList.forEach((marker, index) => {
      // Обновляем номер маркера
      marker.iconContent = (index + 1).toString();

      // Добавляем маркер обратно на карту с обновленным номером
      this.map.geoObjects.add(marker);
    });
  }

  addNewRoute() {

    this.map.geoObjects.remove(this.multiRoute);
    // Обновляем маршрут с учетом новых точек
    const multiRouteModel = new ymaps.multiRouter.MultiRouteModel(this.referencePoints1, {
      routingMode: 'auto',
    });
    this.multiRoute = new ymaps.multiRouter.MultiRoute(multiRouteModel, {
      boundsAutoApply: true,
    });

    this.map.geoObjects.add(this.multiRoute);
  }
}

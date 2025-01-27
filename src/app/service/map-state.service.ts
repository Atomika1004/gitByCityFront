import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MapStateService {
  private map: any;

  async initMap(): Promise<void> {
    await ymaps.ready(() => {
      const mapContainer = document.getElementById('map');
      if (!mapContainer) {
        console.error('ГГ');
        return;
      }

      this.map = new ymaps.Map('map', {
        center: [55.751574, 37.573856],
        zoom: 12,
      });
    });
  }

  clearMap(): void {
    if (this.map) {
      this.map.destroy();
      this.map = null;
    }
  }

  getMap(): any {
    return this.map;
  }
}

import {Component, OnDestroy, OnInit} from '@angular/core';
import {MapStateService} from '../../../service/map-state.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnInit, OnDestroy {

  constructor(private router: Router, private mapStateService: MapStateService) {}

  ngOnInit(): void {
    this.mapStateService.initMap();
  }

  ngOnDestroy(): void {
    this.mapStateService.clearMap();
  }
}

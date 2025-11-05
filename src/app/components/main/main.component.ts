import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {MapStateService} from '../../service/map-state.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements OnInit{
  constructor(protected router: Router, private mapStateService: MapStateService) {}

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.mapStateService.clearMap();
        this.mapStateService.initMap();
      }
    });
  }

  outLogin() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}


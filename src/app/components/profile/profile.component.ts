import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ClientService} from '../../service/client-service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  client: any

  constructor(protected router: Router,
              private clientService: ClientService) {
  }

  ngOnInit(): void {
    this.clientService.getClient().subscribe(response => {
        this.client = response;
        console.log(response);
      }
    )
  }

  outLogin() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  viewRoute(id: number) {
    this.router.navigate(['/main/routes/edit/' + id]);
  }

  viewPlace(id: number) {
    this.router.navigate(['/main/points/edit/' + id])
  }
}

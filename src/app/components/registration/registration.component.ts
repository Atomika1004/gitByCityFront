import {Component, signal} from '@angular/core';
import {Router} from '@angular/router';
import {LoginService} from '../../service/login.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css'
})
export class RegistrationComponent {
  registrationObj: any = {
    fio: '',
    email: '',
    username: '',
    pwd: ''
  };

  constructor(private router: Router, private loginService: LoginService, private route: Router) {}

  onRegistration() {
    if (!this.registrationObj.fio.trim() ||
      !this.registrationObj.username.trim() ||
      !this.registrationObj.pwd.trim() ||
      !this.registrationObj.email.trim()) {
      alert('Все поля должны быть заполнены!');
      return;
    }

    this.loginService.onRegistration(this.registrationObj).subscribe((res: any) => {
      alert(res.message);
    });
  }


  goLogin() {
    this.router.navigate(['/login']);
  }

  hide = signal(true);
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }
}

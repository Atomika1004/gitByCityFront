import {Component, OnInit, signal} from '@angular/core';
import {User} from '../../models/user';
import {Router} from '@angular/router';
import {LoginService} from '../../service/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{
  loginObj: any = {
    username: '',
    password: ''
  };

  constructor(private router: Router, private loginService: LoginService, private route: Router) {}
  ngOnInit() {

  }
  async goToStudent() {
    this.router.navigate(['/main']);
  }

  onLogin() {
    this.loginService.onLogin(this.loginObj).subscribe((res: any) => {

      debugger
      console.log('res', res.accessToken)
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('refreshToken', res.refreshToken);
      localStorage.setItem('user', this.loginObj.username);
      window.location.href = '/main';

    })
  }

  goRegistration() {
    this.router.navigate(['/registration']);
  }

  hide = signal(true);
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }
}

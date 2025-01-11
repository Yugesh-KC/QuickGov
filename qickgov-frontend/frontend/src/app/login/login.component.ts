import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  userName: string;
  password: string;
  isValidUser: boolean = false;
  loginText: string = '';
  skipLogin: boolean;

  constructor(private router: Router, private loginReset: LoginService) {

  }


  ngOnInit() {
    this.userName = '';
  }
  users: { email: string, password: string }[] = [{ email: 'simran', password: '1234' }, { email: 'sexy', password: '12ab' }]

  userCheck() {
    for (let user of this.users) {
      if (this.userName == user.email && this.password == user.password) {
        this.isValidUser = true;
        break;
      }

    }

    if (this.isValidUser == true) {
      this.skipLogin = true;
      console.log(this.isValidUser, this.userName)
      this.router.navigate(['user']);
    }
    else {
      this.skipLogin = false;
      this.loginText = 'Please Enter a valid email or password'

    }
  }

  onSkipLogin() {
    this.skipLogin = true;
    this.router.navigate(['/user']);
  }
}

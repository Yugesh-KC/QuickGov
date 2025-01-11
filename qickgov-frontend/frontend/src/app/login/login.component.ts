import { Component } from '@angular/core';

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


  users: { name: string, password: string }[] = [{ name: 'simran', password: '1234' }, { name: 'sexy', password: '12ab' }]

  userCheck() {
    for (let user of this.users) {
      if (this.userName == user.name && this.password == user.password) {
        this.isValidUser = true;
        break;
      }

    }

    if (this.isValidUser == true) {
      this.skipLogin = true;
      console.log(this.skipLogin, this.isValidUser)
    }
    else {
      this.skipLogin = false;
      console.log(this.skipLogin, this.isValidUser)
    }
  }

  onSkipLogin() {
    this.skipLogin = true;
  }
}

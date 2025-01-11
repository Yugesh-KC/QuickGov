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


  // ngOnInit() {
  //   this.loginReset.loginReset.subscribe((condition: boolean) => {
  //     this.skipLogin = false;
  //     this.userName = '';
  //     this.password = '';
  //     this.isValidUser = false;
  //     this.loginText = '';
  //   })
  // }

  // Reset the logresetLoginForm() 
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
      console.log(this.isValidUser, this.userName)
      this.router.navigate(['user']);
    }
    else {
      this.skipLogin = false;
      this.loginText = 'Please Enter a valid email or password'
      console.log(this.isValidUser)
    }
  }

  onSkipLogin() {
    this.skipLogin = true;
    this.router.navigate(['/user']);
  }
}

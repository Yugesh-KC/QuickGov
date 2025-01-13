import { Component } from '@angular/core';
import { ReleaseService } from '../shared/release.-service.service';
import { Release } from '../shared/release.model';
import { Router } from '@angular/router';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css'
})
export class MainPageComponent {
  hideMainPage: boolean = false;
  constructor(private relService: ReleaseService, private router: Router, private loginser: LoginService) { }

  ngOnInit() {
    // this.loginser.loginReset.emit(true);
    this.relService.releaseDetail.subscribe((id: number) => {
      this.router.navigate(['/detail', id])
      this.loginser.loginReset.subscribe((hideMain: boolean) => {
        this.hideMainPage = hideMain
          ;
        console.log(this.hideMainPage)
      })
      console.log(this.hideMainPage)
    })

  }
}

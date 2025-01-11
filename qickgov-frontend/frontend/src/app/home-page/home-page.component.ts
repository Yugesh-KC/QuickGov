import { Component } from '@angular/core';
import { ReleaseService } from '../shared/release.-service.service';
import { Release } from '../shared/release.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {
  releases: Release[];
  constructor(private releaseService: ReleaseService, private router: Router) {

  }
  ngOnInit() {
    this.releases = this.releaseService.releases;
  }
  onLatestExpand() {
    this.router.navigate(['/latest']);
  }

}

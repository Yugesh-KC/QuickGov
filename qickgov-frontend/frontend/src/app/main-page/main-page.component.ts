import { Component } from '@angular/core';
import { ReleaseService } from '../shared/release.-service.service';
import { Release } from '../shared/release.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css'
})
export class MainPageComponent {
  constructor(private relService: ReleaseService, private router: Router) { }
  ngOnInit() {
    this.relService.releaseDetail.subscribe((release: Release) => {
      this.router.navigate(['/detail'])

    })
  }
}

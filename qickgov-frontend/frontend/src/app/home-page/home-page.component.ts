import { Component, OnInit } from '@angular/core';
import { ReleaseService } from '../shared/release.-service.service';
import { Release } from '../shared/release.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
})
export class HomePageComponent implements OnInit {
  releases: Release[] = []; // Initialize as an empty array

  constructor(private releaseService: ReleaseService, private router: Router) {}

  ngOnInit() {
    console.log('Fetching releases...');
    this.releaseService.getReleases().subscribe(
      (data: Release[]) => {
        console.log('Data received from service:', data);
        this.releases = data;
        console.log('Releases received in HomePageComponent:', this.releases);
      },
      (error) => {
        console.error('Error fetching releases:', error);
      }
    );
  }

  onLatestExpand() {
    this.router.navigate(['/latest']);
  }
}

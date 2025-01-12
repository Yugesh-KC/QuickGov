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
  highlightedButton: string = 'notice'; // Default highlighted button

  constructor(private releaseService: ReleaseService, private router: Router) {}

  ngOnInit() {
    this.fetchReleases();
  }

  fetchReleases(): void {
    this.releaseService.getReleases().subscribe((releases) => {
      this.releases = releases;
    });
  }

  toggleHighlight(type: string): void {
    this.highlightedButton = type;
  }

  get filteredReleases(): Release[] {
    return this.releases.filter(
      (release) => release.type === this.highlightedButton
    );
  }
}

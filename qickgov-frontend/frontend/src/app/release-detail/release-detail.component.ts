import { Component, OnInit } from '@angular/core';
import { Release } from '../shared/release.model';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { ReleaseService } from '../shared/release.-service.service';

@Component({
  selector: 'app-release-detail',
  templateUrl: './release-detail.component.html',
  styleUrls: ['./release-detail.component.css'],
})
export class ReleaseDetailComponent implements OnInit {
  releases: Release[] = [];
  release: Release | undefined;
  private paramSubscription: Subscription;

  constructor(
    private relservice: ReleaseService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.relservice.getReleases().subscribe((data: Release[]) => {
      this.releases = data;

      this.paramSubscription = this.route.params.subscribe((params: Params) => {
        const releaseId = params['id'];
        this.release = this.releases.find(
          (release) => release.id === releaseId
        );
      });
    });
  }

  ngOnDestroy() {
    if (this.paramSubscription) {
      this.paramSubscription.unsubscribe();
    }
  }
}

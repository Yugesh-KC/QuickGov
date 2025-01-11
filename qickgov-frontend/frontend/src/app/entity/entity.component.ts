import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Release } from '../shared/release.model';
import { ReleaseService } from '../shared/release.-service.service';

@Component({
  selector: 'app-entity',
  templateUrl: './entity.component.html',
  styleUrls: ['./entity.component.css'],
})
export class EntityComponent implements OnInit, OnDestroy {
  entityName: string;
  entityReleases: Release[] = [];
  releases: Release[] = [];

  constructor(
    private route: ActivatedRoute,
    private releaseService: ReleaseService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.entityName = params['name'];

      this.entityReleases = [];

      this.releaseService.getReleases().subscribe(
        (data) => {
          this.releases = data;

          for (let release of this.releases) {
            if (release.ministry === this.entityName) {
              this.entityReleases.push(release);
            }
          }

          console.log('Filtered Entity Releases:', this.entityReleases);
        },
        (error) => {
          console.error('Error fetching releases:', error);
        }
      );
    });
  }

  ngOnDestroy() {
    this.entityReleases = [];
  }
}

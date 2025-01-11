import { Component } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Release } from '../shared/release.model';
import { ReleaseService } from '../shared/release.-service.service';

@Component({
  selector: 'app-entity',
  templateUrl: './entity.component.html',
  styleUrl: './entity.component.css'
})
export class EntityComponent {
  releases: Release[];
  entityReleases: Release[];
  entityName: string;
  constructor(private router: Router, private route: ActivatedRoute, private releaseService: ReleaseService) {

  }


  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.entityName = params['name'];

      // Clear previous entityReleases to prevent accumulation
      this.entityReleases = [];

      this.releases = this.releaseService.releases;

      for (let release of this.releases) {
        if (release.source === this.entityName) {
          this.entityReleases.push(release);
        }
      }
    });
  }

  ngOnDestroy() {
    this.entityReleases = [];
  }

}

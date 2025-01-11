import { Component, Input } from '@angular/core';
import { ReleaseService } from '../shared/release.-service.service';
import { Release } from '../shared/release.model';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-release-detail',
  templateUrl: './release-detail.component.html',
  styleUrl: './release-detail.component.css'
})
export class ReleaseDetailComponent {
  releases: Release[];
  release: Release;
  chat: string;
  constructor(private relservice: ReleaseService, private route: ActivatedRoute) {

  }

  ngOnInit() {
    this.releases = this.relservice.getRelease();
    this.route.params.subscribe((params: Params) => {

      for (let release of this.releases) {
        if (release.id == parseInt(params['id'])) {
          this.release = release;
        }
      }
    })
  }


}

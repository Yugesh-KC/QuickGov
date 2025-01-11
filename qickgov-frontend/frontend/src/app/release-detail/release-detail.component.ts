import { Component, Input } from '@angular/core';
import { ReleaseService } from '../shared/release.-service.service';
import { Release } from '../shared/release.model';

@Component({
  selector: 'app-release-detail',
  templateUrl: './release-detail.component.html',
  styleUrl: './release-detail.component.css'
})
export class ReleaseDetailComponent {
  @Input() release: Release;
  constructor(private relservice: ReleaseService) {

  }


}

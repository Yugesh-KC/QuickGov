import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Release } from '../../shared/release.model';
import { ReleaseService } from '../../shared/release.-service.service';

@Component({
  selector: 'app-release',
  templateUrl: './release.component.html',
  styleUrls: ['./release.component.css'],
})
export class ReleaseComponent implements OnChanges {
  @Input() release: Release;

  constructor(private releaseService: ReleaseService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.release) {
      console.log('Release received in ReleaseComponent:', this.release);
    }
  }

  onClick() {
    this.releaseService.releaseDetail.emit(this.release.id);
    console.log('Click has occurred for release ID:', this.release.id);
  }
}

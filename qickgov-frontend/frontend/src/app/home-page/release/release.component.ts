import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Release } from '../../shared/release.model';
import { ReleaseService } from '../../shared/release.-service.service';
import { MinistryMappingService } from '../../shared/ministrymapping.service';

@Component({
  selector: 'app-release',
  templateUrl: './release.component.html',
  styleUrls: ['./release.component.css'],
})
export class ReleaseComponent implements OnChanges {
  @Input() release: Release;
  fullMinistryName: string;

  constructor(
    private releaseService: ReleaseService,
    private ministryMappingService: MinistryMappingService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.release) {
      console.log('Release received in ReleaseComponent:', this.release);
      this.fullMinistryName = this.ministryMappingService.getMinistryName(
        this.release.ministry
      );
    }
  }

  onClick() {
    this.releaseService.releaseDetail.emit(this.release.id);
    console.log('Click has occurred for release ID:', this.release.id);
  }
}

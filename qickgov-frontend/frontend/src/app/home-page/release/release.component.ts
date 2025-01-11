import { Component, Input } from '@angular/core';
import { ReleaseService } from '../../shared/release.-service.service';
import { Release } from '../../shared/release.model';

@Component({
  selector: 'app-release',
  templateUrl: './release.component.html',
  styleUrl: './release.component.css'
})
export class ReleaseComponent {
  @Input() release: Release;
  //leases: Release[];
  constructor(private releaseService: ReleaseService) {

  }
  ngOnInit() {
    // this.releases = this.releaseService.releases;
  }
  onClick() {
    this.releaseService.releaseDetail.emit(this.release);
    console.log('click has occured')
  }
}

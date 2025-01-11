import { Component, input, Input } from '@angular/core';
import { ReleaseService } from '../../shared/release.-service.service';
import { Release } from '../../shared/release.model';
import { BookmarkService } from '../../shared/bookmark.service';

@Component({
  selector: 'app-release',
  templateUrl: './release.component.html',
  styleUrl: './release.component.css'
})
export class ReleaseComponent {
  @Input() release: Release;
  @Input() isPinned: boolean = false;

  //leases: Release[];
  constructor(private releaseService: ReleaseService, private bookser: BookmarkService) {

  }
  ngOnInit() {
    // this.releases = this.releaseService.releases;
  }
  onClick() {
    this.releaseService.releaseDetail.emit(this.release.id);
    console.log('click has occured')
  }
  onPinToggle(event: Event) {
    this.isPinned = !this.isPinned;
    event.stopPropagation()

  }
}

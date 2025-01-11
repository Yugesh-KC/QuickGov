import { Injectable } from '@angular/core';
import { Release } from './release.model';
import { BookMark } from './bookmark.model';
import { Observable } from 'rxjs';
import { ReleaseService } from './release.-service.service';

@Injectable({
  providedIn: 'root',
})
export class BookmarkService {
  private bookmarks: BookMark[] = [];

  constructor(private rlservice: ReleaseService) {}

  initializeBookmarks() {
    this.rlservice.getReleases().subscribe(
      (releases) => {
        console.log('Releases received in BookmarkService:', releases);
        if (Array.isArray(releases)) {
          this.bookmarks = releases.map((release) => ({
            title: release.article,
            releases: [release],
          }));
        } else {
          console.error('Releases is not an array:', releases);
          this.bookmarks = [];
        }
      },
      (error) => {
        console.error('Error in initializeBookmarks:', error);
        this.bookmarks = [];
      }
    );
  }

  getBookMark() {
    return this.bookmarks.slice();
  }

  removeBookmark() {}
}

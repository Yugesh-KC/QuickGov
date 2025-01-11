import { Release } from "./release.model";
import { BookMark } from "./bookmark.model";
import { ReleaseService } from "./release.-service.service";
import { Injectable } from "@angular/core";
@Injectable()
export class BookmarkService {
  private bookmarks: BookMark[];
  constructor(private rlservice: ReleaseService) {
    this.bookmarks =
      [{
        id: 1, title: 'Melanchi', releases: this.rlservice.getRelease()
      },
      {
        id: 2, title: 'Melanchi', releases: this.rlservice.getRelease()
      },
      {
        id: 3, title: 'Melanchi', releases: this.rlservice.getRelease()
      },
      {
        id: 4, title: 'Melanchi', releases: this.rlservice.getRelease()
      },
      {
        id: 5, title: 'Melanchi', releases: this.rlservice.getRelease()
      }
      ]

  }


  ngOnInit() {


  }


  getBookMark() {
    return this.bookmarks.slice();
  }

  addBookmark(bookmark: BookMark) {
    this.bookmarks.push(bookmark);
  }
  // addBookmark() { }
  removeBookmark(id: number) {
    this.bookmarks.splice(id, 1)
  }
}
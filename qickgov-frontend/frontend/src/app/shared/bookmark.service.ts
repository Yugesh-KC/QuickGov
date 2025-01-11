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
      title: 'Melanchi', releases: this.rlservice.getRelease()
    },
    {
      title: 'Melanchi', releases: this.rlservice.getRelease()
    },
    {
      title: 'Melanchi', releases: this.rlservice.getRelease()
    },
    {
      title: 'Melanchi', releases: this.rlservice.getRelease()
    },
    {
      title: 'Melanchi', releases: this.rlservice.getRelease()
    }
    ]

  }


  ngOnInit() {


  }


  getBookMark() {
    return this.bookmarks.slice();
  }
  // addBookmark() { }
  removeBookmark() { }
}
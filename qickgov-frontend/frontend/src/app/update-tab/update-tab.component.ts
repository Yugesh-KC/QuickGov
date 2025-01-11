import { Component, OnInit } from '@angular/core';
import { BookmarkService } from '../shared/bookmark.service';
import { BookMark } from '../shared/bookmark.model';
import { UserService } from '../shared/user.service';

@Component({
  selector: 'app-update-tab',
  templateUrl: './update-tab.component.html',
  styleUrls: ['./update-tab.component.css'],
})
export class UpdateTabComponent implements OnInit {
  bookmarks: BookMark[] = [];

  constructor(
    private bookmarkService: BookmarkService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    if (this.userService.hasUserId()) {
      this.bookmarkService.initializeBookmarks().subscribe((bookmarks) => {
        this.bookmarks = bookmarks;
      });
    }
  }

  hasUserId(): boolean {
    return this.userService.hasUserId();
  }
}

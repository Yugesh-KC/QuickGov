import { Component, OnInit } from '@angular/core';
import { BookmarkService } from '../shared/bookmark.service';
import { BookMark } from '../shared/bookmark.model';
import { Router } from '@angular/router';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-update-tab',
  templateUrl: './update-tab.component.html',
  styleUrls: ['./update-tab.component.css'],
})
export class UpdateTabComponent implements OnInit {
  bookmarks: BookMark[] = [];

  constructor(
    private bookmarkService: BookmarkService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // if (this.userService.hasUserId()) {
    this.bookmarkService.initializeBookmarks().subscribe((bookmarks) => {
      this.bookmarks = bookmarks;
    });
    // }
  }
  onUpdateDisplay() {
    this.router.navigate(['/update']);
  }

  hasToken(): boolean {
    return this.authService.hasToken();
  }
}

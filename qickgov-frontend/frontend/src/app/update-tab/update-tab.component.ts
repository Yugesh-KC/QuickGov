import { Component } from '@angular/core';
import { BookmarkService } from '../shared/bookmark.service';
import { BookMark } from '../shared/bookmark.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-update-tab',
  templateUrl: './update-tab.component.html',
  styleUrl: './update-tab.component.css'
})
export class UpdateTabComponent {
  bookmarks: BookMark[]
  constructor(private bmrkservice: BookmarkService, private router: Router) { }
  ngOnInit() {
    this.bookmarks = this.bmrkservice.getBookMark();
  }
  onUpdateDisplay() {
    this.router.navigate(['/update'])
  }

}

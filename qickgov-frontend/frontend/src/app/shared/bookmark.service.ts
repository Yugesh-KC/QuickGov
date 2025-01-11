import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BookMark } from './bookmark.model';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class BookmarkService {
  private bookmarks: BookMark[] = [];

  constructor(private http: HttpClient, private userService: UserService) {}

  initializeBookmarks(): Observable<BookMark[]> {
    const userId = this.userService.getUserId();
    if (!userId) {
      console.error('User ID is not set');
      return new Observable<BookMark[]>((observer) => {
        observer.next([]);
        observer.complete();
      });
    }

    const url = `http://localhost:8080/api/bookmark/${userId}/articles`;

    return this.http.get<{ data: BookMark[] }>(url).pipe(
      map((response) => {
        console.log('Bookmarks received:', response.data);
        this.bookmarks = response.data;
        return this.bookmarks;
      }),
      catchError((error) => {
        console.error('Error fetching bookmarks:', error);
        return new Observable<BookMark[]>((observer) => {
          observer.next([]);
          observer.complete();
        });
      })
    );
  }

  getBookmarks(): BookMark[] {
    return this.bookmarks;
  }
}

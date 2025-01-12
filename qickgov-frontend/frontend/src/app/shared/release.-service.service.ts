import { HttpClient } from '@angular/common/http';
import { Injectable, EventEmitter } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Release } from './release.model';

@Injectable({
  providedIn: 'root',
})
export class ReleaseService {
  releaseDetail = new EventEmitter<string>();
  private apiUrl = 'http://localhost:8080/api/article/';
  private releases: Release[] = [];
  private isFetching: boolean = false;

  constructor(private http: HttpClient) {}

  getReleases(): Observable<Release[]> {
    if (this.releases.length > 0) {
      console.log('Returning cached releases:', this.releases);
      return of(this.releases);
    }

    if (!this.isFetching) {
      this.isFetching = true;
      return this.http.get<{ data: any[] }>(this.apiUrl).pipe(
        map((response) => {
          console.log('API response:', response);
          if (Array.isArray(response.data)) {
            const types = [
              'notice',
              'release',
              'progressReport',
              'publication',
            ];
            this.releases = response.data
              .filter(
                (release) => release.article && release.article.trim() !== ''
              )
              .map(
                (release) =>
                  new Release(
                    release.ID,
                    release.date,
                    release.title,
                    release.location,
                    release.article,
                    release.ministry,
                    types[Math.floor(Math.random() * types.length)] // Randomly assign type
                  )
              );
          } else {
            this.releases = [];
          }
          this.isFetching = false;
          console.log('Filtered releases from API:', this.releases);
          return this.releases;
        }),
        catchError((error) => {
          this.isFetching = false;
          console.error('Error fetching releases:', error);
          return of([]);
        })
      );
    } else {
      return of([]);
    }
  }
}

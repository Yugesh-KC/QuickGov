import { EventEmitter } from "@angular/core";
import { Release } from "./release.model";
export class ReleaseService {

  releaseDetail = new EventEmitter<Release>();

  releases: Release[] = [{ id: 1, type: 'notice', summary: 'summary text', source: 'Minisry of health', URL: 'https://www.moha.gov.np/' }, { id: 1, type: 'notice', summary: 'summary text', source: 'Minisry of health', URL: 'https://www.moha.gov.np/' }, { id: 2, type: 'Release', summary: 'summary text', source: 'Minisry of health', URL: 'https://www.moha.gov.np/' }, { id: 1, type: 'notice', summary: 'summary text', source: 'Minisry of health', URL: 'https://www.moha.gov.np/' }, { id: 1, type: 'notice', summary: 'summary text', source: 'Minisry of health', URL: 'https://www.moha.gov.np/' }, { id: 1, type: 'notice', summary: 'summary text', source: 'Minisry of health', URL: 'https://www.moha.gov.np/' }
  ];

  getRelease() {
    return this.releases.slice();
  }
  addRelease(release: Release) {
    this.releases.push(release);
  }


  addToBookmark() { }






}
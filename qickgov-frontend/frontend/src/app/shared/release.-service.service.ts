import { EventEmitter } from "@angular/core";
import { Release } from "./release.model";
export class ReleaseService {

  releaseDetail = new EventEmitter<Release>();

  releases: Release[] = [{ id: 1023, type: 'notice', summary: 'Summary for Ministry of Home Affairs', source: 'Ministry of Home Affairs', URL: 'https://mohp.gov.np/' },
  { id: 2045, type: 'notice', summary: 'Summary for Ministry of Foreign Affairs', source: 'Ministry of Foreign Affairs', URL: 'https://mofa.gov.np/' },
  { id: 3567, type: 'notice', summary: 'Summary for Ministry of Finance', source: 'Ministry of Finance', URL: 'https://mof.gov.np/' },
  { id: 4789, type: 'notice', summary: 'Summary for Ministry of Education, Science and Technology', source: 'Ministry of Education, Science and Technology', URL: 'http://www.moe.gov.np/' },
  { id: 5231, type: 'notice', summary: 'Summary for Ministry of Health and Population', source: 'Ministry of Health and Population', URL: 'https://mohp.gov.np/' },
  { id: 6342, type: 'notice', summary: 'Summary for Ministry of Law, Justice and Parliamentary Affairs', source: 'Ministry of Law, Justice and Parliamentary Affairs', URL: 'https://moljpa.gov.np/' },
  { id: 7583, type: 'notice', summary: 'Summary for Ministry of Labour, Employment and Social Security', source: 'Ministry of Labour, Employment and Social Security', URL: 'http://www.mole.gov.np/' },
  { id: 8294, type: 'notice', summary: 'Summary for Ministry of Energy, Water Resources and Irrigation', source: 'Ministry of Energy, Water Resources and Irrigation', URL: 'https://www.moewri.gov.np/' },
  { id: 9315, type: 'notice', summary: 'Summary for Ministry of Agriculture and Livestock Development', source: 'Ministry of Agriculture and Livestock Development', URL: 'http://www.moald.gov.np/' },
  { id: 10426, type: 'notice', summary: 'Summary for Ministry of Industry, Commerce and Supplies', source: 'Ministry of Industry, Commerce and Supplies', URL: 'http://www.moics.gov.np/' },
  { id: 11537, type: 'notice', summary: 'Summary for Ministry of Environment', source: 'Ministry of Environment', URL: 'https://www.moen.gov.np/' },
  { id: 12648, type: 'notice', summary: 'Summary for Ministry of Defense', source: 'Ministry of Defense', URL: 'https://www.mod.gov.np/' },
  { id: 13759, type: 'notice', summary: 'Summary for Ministry of Information and Communication', source: 'Ministry of Information and Communication', URL: 'http://www.moic.gov.np/' },
  { id: 14860, type: 'notice', summary: 'Summary for Ministry of Youth and Sports', source: 'Ministry of Youth and Sports', URL: 'http://www.moys.gov.np/' },
  { id: 15971, type: 'notice', summary: 'Summary for Ministry of Urban Development', source: 'Ministry of Urban Development', URL: 'https://www.moud.gov.np/' },
  { id: 17082, type: 'notice', summary: 'Summary for Ministry of Women, Children and Senior Citizens', source: 'Ministry of Women, Children and Senior Citizens', URL: 'http://www.mowcsc.gov.np/' },
  { id: 18193, type: 'notice', summary: 'Summary for Ministry of Tourism, Culture and Civil Aviation', source: 'Ministry of Tourism, Culture and Civil Aviation', URL: 'https://www.tourism.gov.np/' },
  { id: 19204, type: 'notice', summary: 'Summary for Ministry of Transport Management', source: 'Ministry of Transport Management', URL: 'https://www.motm.gov.np/' },
  { id: 20315, type: 'notice', summary: 'Summary for Ministry of Physical Infrastructure and Transport', source: 'Ministry of Physical Infrastructure and Transport', URL: 'http://www.mopit.gov.np/' },
  { id: 21426, type: 'notice', summary: 'Summary for Ministry of Science and Technology', source: 'Ministry of Science and Technology', URL: 'http://www.most.gov.np/' }
  ];

  getRelease() {
    return this.releases.slice();
  }
  addRelease(release: Release) {
    this.releases.push(release);
  }


  addToBookmark() { }






}
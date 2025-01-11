import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MinistryMappingService {
  private ministryMap: { [key: string]: string } = {
    mohp: 'Ministry of Health and Population',
    moha: 'Ministry of Home Affairs',
  };

  getMinistryName(abbreviation: string): string {
    return this.ministryMap[abbreviation] || 'Unknown Ministry';
  }
}

import { Release } from './release.model';

export interface BookMark {
  topic: string;
  articles: Release[];
}

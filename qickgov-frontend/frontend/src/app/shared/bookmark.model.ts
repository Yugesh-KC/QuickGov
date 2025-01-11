import { Release } from "./release.model"
export class BookMark {

  constructor(public id: number, public title: string, public releases: Release[]) { }

}
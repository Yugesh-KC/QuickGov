export class Release {
  public id: string;
  public date: string;
  public title: string;
  public location: string;
  public article: string;
  public ministry: string;
  public type: string; // New field

  constructor(
    id: string,
    date: string,
    title: string,
    location: string,
    article: string,
    ministry: string,
    type: string // New field
  ) {
    this.id = id;
    this.date = date;
    this.title = title;
    this.location = location;
    this.article = article;
    this.ministry = ministry;
    this.type = type; // New field
  }
}

export class Release {
  public id: string;
  public date: string;
  public title: string;
  public location: string;
  public article: string;
  public ministry: string;

  constructor(
    id: string,
    date: string,
    title: string,
    location: string,
    article: string,
    ministry: string
  ) {
    this.id = id;
    this.date = date;
    this.title = title;
    this.location = location;
    this.article = article;
    this.ministry = ministry;
  }
}

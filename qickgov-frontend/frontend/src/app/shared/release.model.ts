export class Release {
  public type: string;
  public summary: string;
  public source: string;
  public URL: string;
  public id: number;

  constructor(id: number, type: string, summary: string, source: string, URL: string) {
    this.type = type;
    this.summary = summary;
    this.URL = URL;

  }
}
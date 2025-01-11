export class Release {
  public type: string;
  public summary: string;
  public source: string;
  public URL: string;
  public id: number;
  public imagePath: string
  public pdfPath: string
  // public date: Date

  constructor(id: number, type: string, summary: string, source: string, URL: string,
    imagePath: string,
    pdfPath: string) {
    this.type = type;
    this.summary = summary;
    this.URL = URL;
    this.imagePath = imagePath;
    this.pdfPath = pdfPath;
    // this.date = date;
  }
}
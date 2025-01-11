import { Release } from "./release.model";
import { BookMark } from "./bookmark.model";
export class BookmarkService {
  private bookmarks: BookMark[] = [{
    title: 'Melanchi', releases: [{ id: 1, type: 'notice', summary: 'summary text', source: 'Minisry of health', URL: 'https://www.moha.gov.np/' }, { id: 1, type: 'notice', summary: 'summary text', source: 'Minisry of health', URL: 'https://www.moha.gov.np/' }, { id: 1, type: 'notice', summary: 'summary text', source: 'Minisry of health', URL: 'https://www.moha.gov.np/' }, { id: 1, type: 'notice', summary: 'summary text', source: 'Minisry of health', URL: 'https://www.moha.gov.np/' }, { id: 1, type: 'notice', summary: 'summary text', source: 'Minisry of health', URL: 'https://www.moha.gov.np/' }, { id: 1, type: 'notice', summary: 'summary text', source: 'Minisry of health', URL: 'https://www.moha.gov.np/' }
    ]
  },
  {
    title: 'Melanchi', releases: [{ id: 1, type: 'notice', summary: 'summary text', source: 'Minisry of health', URL: 'https://www.moha.gov.np/' }, { id: 1, type: 'notice', summary: 'summary text', source: 'Minisry of health', URL: 'https://www.moha.gov.np/' }, { id: 1, type: 'notice', summary: 'summary text', source: 'Minisry of health', URL: 'https://www.moha.gov.np/' }, { id: 1, type: 'notice', summary: 'summary text', source: 'Minisry of health', URL: 'https://www.moha.gov.np/' }, { id: 1, type: 'notice', summary: 'summary text', source: 'Minisry of health', URL: 'https://www.moha.gov.np/' }, { id: 1, type: 'notice', summary: 'summary text', source: 'Minisry of health', URL: 'https://www.moha.gov.np/' }
    ]
  },
  {
    title: 'Melanchi', releases: [{ id: 1, type: 'notice', summary: 'summary text', source: 'Minisry of health', URL: 'https://www.moha.gov.np/' }, { id: 1, type: 'notice', summary: 'summary text', source: 'Minisry of health', URL: 'https://www.moha.gov.np/' }, { id: 1, type: 'notice', summary: 'summary text', source: 'Minisry of health', URL: 'https://www.moha.gov.np/' }, { id: 1, type: 'notice', summary: 'summary text', source: 'Minisry of health', URL: 'https://www.moha.gov.np/' }, { id: 1, type: 'notice', summary: 'summary text', source: 'Minisry of health', URL: 'https://www.moha.gov.np/' }, { id: 1, type: 'notice', summary: 'summary text', source: 'Minisry of health', URL: 'https://www.moha.gov.np/' }
    ]
  }];

  getBookMark() {
    return this.bookmarks.slice();
  }
  // addBookmark() { }
  removeBookmark() { }
}
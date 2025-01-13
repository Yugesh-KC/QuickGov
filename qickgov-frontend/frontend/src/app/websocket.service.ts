import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, BehaviorSubject } from 'rxjs';
import { AuthService } from './shared/auth.service';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private socket$: WebSocketSubject<any> | undefined;
  private messagesSubject = new BehaviorSubject<any>(null);
  public messages$: Observable<any> = this.messagesSubject.asObservable();

  constructor(private authService: AuthService) {}

  connect(wsUrl: string = 'http://localhost:8080/api/ws'): void {
    const token = this.authService.getToken();
    const urlWithToken = token ? `${wsUrl}?token=${token}` : wsUrl; // Append token to URL

    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = webSocket(urlWithToken);

      this.socket$.subscribe(
        (message) => this.messagesSubject.next(message),
        (error) => console.error('WebSocket error:', error),
        () => console.warn('WebSocket connection closed')
      );
    }
  }

  sendMessage(message: any): void {
    if (this.socket$) {
      this.socket$.next(message);
    } else {
      console.error('WebSocket is not connected.');
    }
  }

  close(): void {
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = undefined;
    }
  }
}

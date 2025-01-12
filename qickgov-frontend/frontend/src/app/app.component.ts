// app.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from './shared/auth.service';
import { WebsocketService } from './websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  private wsSubscription: Subscription | undefined;
  constructor(
    private authService: AuthService,
    private websocketService: WebsocketService
  ) {}

  ngOnInit(): void {
    this.authService.checkExistingToken();
    this.websocketService.connect();
    this.wsSubscription = this.websocketService.messages$.subscribe(
      (message) => {
        console.log(message);
      }
    );
  }

  ngOnDestroy(): void {
    this.websocketService.close();
  }
}

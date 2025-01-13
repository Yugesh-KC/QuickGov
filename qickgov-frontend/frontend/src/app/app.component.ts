// app.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from './shared/auth.service';
import { WebsocketService } from './websocket.service';
import { Subscription } from 'rxjs';
import { ReleaseService } from './shared/release.-service.service';
import { PushNotificationsService } from './shared/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  private wsSubscription: Subscription | undefined;
  constructor(
    private authService: AuthService,
    private websocketService: WebsocketService,
    private releaseService: ReleaseService,
    private _notificationService: PushNotificationsService
  ) {}

  ngOnInit(): void {
    this.authService.checkExistingToken();
    this._notificationService.requestPermission();
    this.websocketService.connect();
    this.wsSubscription = this.websocketService.messages$.subscribe(
      (message) => {
        if (message) {
          console.log(message);
          this.releaseService.notify(message.message);
        }
        this.releaseService.getReleases().subscribe();
      }
    );
  }

  ngOnDestroy(): void {
    this.websocketService.close();
  }
}

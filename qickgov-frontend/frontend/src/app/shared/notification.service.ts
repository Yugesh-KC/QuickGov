import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';

@Injectable({
  providedIn: 'root',
})
export class PushNotificationsService {
  constructor(private swPush: SwPush) {}

  requestPermission() {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
      }
    });
  }

  generateNotification(data: any) {
    const notification = new Notification(data.title, {
      body: data.alertContent,
      icon: 'assets/icon.png',
    });
    notification.onclick = () => {
      window.open('https://your-url.com'); // Redirect on click
    };
  }
}

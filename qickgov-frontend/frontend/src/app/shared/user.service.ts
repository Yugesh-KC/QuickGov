import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userId: string | null = null;

  setUserId(id: string) {
    this.userId = id;
  }

  getUserId(): string | null {
    return this.userId;
  }

  hasUserId(): boolean {
    return this.userId !== null;
  }
}

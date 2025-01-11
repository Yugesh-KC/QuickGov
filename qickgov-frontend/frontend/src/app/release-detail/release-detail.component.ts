import { Component, OnInit, OnDestroy } from '@angular/core';
import { Release } from '../shared/release.model';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { ReleaseService } from '../shared/release.-service.service';

@Component({
  selector: 'app-release-detail',
  templateUrl: './release-detail.component.html',
  styleUrls: ['./release-detail.component.css'],
})
export class ReleaseDetailComponent implements OnInit, OnDestroy {
  releases: Release[] = [];
  release: Release | undefined;
  private paramSubscription: Subscription;

  chat: string = '';
  textArray: { text: string; type: string }[] = []; // Array to hold chat messages and their types

  constructor(
    private relservice: ReleaseService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.paramSubscription = this.route.params.subscribe((params: Params) => {
      const releaseId = params['id'];
      this.relservice.getReleases().subscribe((data: Release[]) => {
        this.releases = data;

        for (let release of this.releases) {
          if (release.id === releaseId) {
            this.release = release;
            break;
          }
        }

        console.log('Filtered Entity Releases:', this.release);
      });
    });
  }

  ngOnDestroy() {
    if (this.paramSubscription) {
      this.paramSubscription.unsubscribe();
    }
  }

  // Method to handle text input and bot responses
  onEnterText() {
    if (this.chat.trim()) {
      // Add user's message to the array
      this.textArray.push({ text: this.chat, type: 'user' });

      // Generate a bot response (for now, we'll just echo the message)
      const botResponse = `Bot: You said "${this.chat}"`; // Example response
      this.textArray.push({ text: botResponse, type: 'bot' });

      // Clear the input field after sending the message
      this.chat = '';
    }
  }
}

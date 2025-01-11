import { Component, Input } from '@angular/core';
import { ReleaseService } from '../shared/release.-service.service';
import { Release } from '../shared/release.model';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-release-detail',
  templateUrl: './release-detail.component.html',
  styleUrl: './release-detail.component.css'
})
export class ReleaseDetailComponent {
  releases: Release[];
  release: Release;
  chat: string;
  constructor(private relservice: ReleaseService, private route: ActivatedRoute) {

  }

  ngOnInit() {
    this.releases = this.relservice.getRelease();
    this.route.params.subscribe((params: Params) => {

      for (let release of this.releases) {
        if (release.id == parseInt(params['id'])) {
          this.release = release;
        }
      }
    })



  }



  textArray: { text: string, type: string }[] = []; // Array to hold chat messages and their types


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

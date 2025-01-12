import { Component, OnInit, OnDestroy } from '@angular/core';
import { Release } from '../shared/release.model';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { ReleaseService } from '../shared/release.-service.service';
import { MinistryMappingService } from '../shared/ministrymapping.service';

@Component({
  selector: 'app-release-detail',
  templateUrl: './release-detail.component.html',
  styleUrls: ['./release-detail.component.css'],
})
export class ReleaseDetailComponent implements OnInit, OnDestroy {
  releases: Release[] = [];
  release: Release | undefined;
  fullMinistryName: string | undefined;
  imageLocation: string | undefined;
  isModalOpen = false;
  private paramSubscription: Subscription;

  chat: string = '';
  textArray: { text: string; type: string }[] = []; // Array to hold chat messages and their types

  constructor(
    private relservice: ReleaseService,
    private route: ActivatedRoute,
    private ministryMappingService: MinistryMappingService
  ) {}

  ngOnInit() {
    this.paramSubscription = this.route.params.subscribe((params: Params) => {
      const releaseId = params['id'];
      this.relservice.getReleases().subscribe((data: Release[]) => {
        this.releases = data;

        for (let release of this.releases) {
          if (release.id === releaseId) {
            this.release = release;
            console.log(this.imageLocation);
            this.imageLocation = `assets/images/${release.location}`;
            this.fullMinistryName = this.ministryMappingService.getMinistryName(
              release.ministry
            );
            break;
          }
        }

        console.log('Filtered Entity Releases:', this.release);
      });
    });
  }
  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
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

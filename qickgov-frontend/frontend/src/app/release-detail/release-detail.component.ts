import { Component, OnInit, OnDestroy } from '@angular/core';
import { Release } from '../shared/release.model';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { ReleaseService } from '../shared/release.-service.service';
import { MinistryMappingService } from '../shared/ministrymapping.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
    private ministryMappingService: MinistryMappingService,
    private http: HttpClient
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

      // Prepare the request body
      const body = {
        message: this.chat,
        image: 'qickgov-frontend/frontend/src/' + this.imageLocation,
      };
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      this.chat = '';
      // Make the POST request to the chatbot API
      this.http
        .post<{ response: string }>('http://localhost:4949/chat', body, {
          headers,
        })
        .subscribe(
          (response) => {
            // Add bot's response to the array
            const botResponse = response.response;
            this.textArray.push({ text: botResponse, type: 'bot' });

            // Clear the input field after sending the message
            this.chat = '';
          },
          (error) => {
            console.error('Error during chat request:', error);
            // Handle error case (optional)
            this.textArray.push({
              text: 'Bot: Sorry, something went wrong.',
              type: 'bot',
            });
            this.chat = '';
          }
        );
    }
  }
}

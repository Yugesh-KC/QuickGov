import { Component, Input } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css'],
})
export class ChatbotComponent {
  chat: string = ''; // User's input message
  textArray: { text: string; type: string; isTyping?: boolean }[] = []; // Array to hold chat messages and their types
  @Input() hasNav: boolean = true;
  isExpanded: boolean = false;
  isLoading: boolean = false;

  constructor(private http: HttpClient) {}

  // Method for toggling the chatbot expansion (optional)
  onChatClick() {
    this.isExpanded = !this.isExpanded;
  }

  // Method to handle text input and bot responses
  onEnterText() {
    if (this.chat.trim()) {
      // Add user's message to the array
      this.textArray.push({ text: this.chat, type: 'user' });

      // Prepare the request body
      const body = { message: this.chat };
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      this.chat = '';
      this.isLoading = true;

      // Make the POST request to the chatbot API
      this.http
        .post<{ response: string }>('http://localhost:5000/chat', body, {
          headers,
        })
        .subscribe(
          (response) => {
            // Add bot's response to the array with typewriter effect
            const botResponse = this.sanitizeText(response.response);
            this.textArray.push({ text: '', type: 'bot', isTyping: true });
            this.isLoading = false;

            let index = 0;
            const interval = setInterval(() => {
              if (index < botResponse.length) {
                this.textArray[this.textArray.length - 1].text +=
                  botResponse[index];
                index++;
              } else {
                this.textArray[this.textArray.length - 1].isTyping = false;
                clearInterval(interval);
              }
            }, 50);
          },
          (error) => {
            console.error('Error during chat request:', error);
            // Handle error case (optional)
            this.textArray.push({
              text: 'Bot: Sorry, something went wrong.',
              type: 'bot',
            });
            this.isLoading = false;
            this.chat = '';
          }
        );
    }
  }

  // Method to sanitize text by removing multiple line breaks
  sanitizeText(text: string): string {
    return text.replace(/(\r\n|\n\n|\r){2,}/g, '$1');
  }
}

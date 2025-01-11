import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent {
  isExpanded: boolean = false;
  chat: string = '';  // User's input message
  textArray: { text: string, type: string }[] = []; // Array to hold chat messages and their types
  @Input() hasNav: boolean = true;
  // Method for toggling the chatbot expansion (optional)
  onChatClick() {
    this.isExpanded = !this.isExpanded;
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

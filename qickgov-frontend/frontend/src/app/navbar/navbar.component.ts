import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  isActive: boolean = false;
  isDropdownOpen: boolean = false;
  isActiveBtn() {
    this.isActive = !this.isActive;

  }
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
}

import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  isActive: boolean = false;
  isDropdownOpen: boolean = false;
  isActiveEntity: boolean = false;
  isDropdownOpenEntity: boolean = false;
  isActiveBtn() {
    this.isActive = !this.isActive;
    this.isActiveEntity = false;


  }
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    this.isDropdownOpenEntity = false;

  }

  isActiveBtnEntity() {
    this.isActiveEntity = !this.isActiveEntity;
    this.isActive = false;

  }
  toggleDropdownEntity() {
    this.isDropdownOpen = false;

    this.isDropdownOpenEntity = !this.isDropdownOpenEntity;
  }


}

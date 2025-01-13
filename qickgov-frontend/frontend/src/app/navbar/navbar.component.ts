import { Component } from '@angular/core';
import { EntityService } from '../shared/entities.service';
import { Router } from '@angular/router';
import { Entity } from '../shared/entity.model';
import { LoginService } from '../login.service';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  isActive: boolean = false;
  isDropdownOpen: boolean = false;
  isActiveEntity: boolean = false;
  isDropdownOpenEntity: boolean = false;
  isMobileMenuOpen = false;
  isMobileEntityDropdownOpen = false;
  entities: { name: string; url: string }[];
  entitySearch: String;
  filteredEntities: Entity[];
  isLoggedIn: boolean = false;

  constructor(
    private entityService: EntityService,
    private router: Router,
    private lser: LoginService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.entities = this.entityService.getEntity();
    this.filteredEntities = [...this.entities];

    if (this.authService.getToken()) {
      this.isLoggedIn = true;
    }
  }

  login() {
    this.router.navigate(['/update']);
    this.lser.loginReset.emit(true);
  }

  onLogout() {
    this.authService.logout();
    this.isLoggedIn = false;
  }

  isActiveBtn() {
    this.isActive = !this.isActive;
    this.isActiveEntity = false;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleMobileEntityDropdown() {
    this.isMobileEntityDropdownOpen = !this.isMobileEntityDropdownOpen;
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

  goToEntity(entity: Entity) {
    this.router.navigate(['/entity', entity.name]);
  }

  filterEntities() {
    if (this.entitySearch.trim() === '') {
      this.filteredEntities = [...this.entities];
    } else {
      this.filteredEntities = this.entities.filter((entity) =>
        entity.name.toLowerCase().includes(this.entitySearch.toLowerCase())
      );
    }
  }
}

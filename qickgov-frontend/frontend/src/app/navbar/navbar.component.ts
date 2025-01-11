import { Component } from '@angular/core';
import { EntityService } from '../shared/entities.service';
import { Router } from '@angular/router';
import { Entity } from '../shared/entity.model';
import { LoginService } from '../login.service';

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
  entities: { name: string, url: string }[];
  entitySearch: String;
  filteredEntities: Entity[];
  isLoggedIn: boolean = false;
  constructor(private entityService: EntityService, private router: Router, private lser: LoginService) {

  }
  login() {
    this.router.navigate(['/update'])
    this.lser.loginReset.emit(true);
  }
  ngOnInit() {
    this.entities = this.entityService.getEntity();

    this.filteredEntities = [...this.entities];  // Initialize filteredEntities to all entities
  }
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
  goToEntity(entity: Entity) {
    this.router.navigate(['/entity', entity.name])
  }
  filterEntities() {
    if (this.entitySearch.trim() === '') {
      // If search input is empty, display all entities
      this.filteredEntities = [...this.entities];
    } else {
      // Filter the entities based on the search query
      this.filteredEntities = this.entities.filter(entity =>
        entity.name.toLowerCase().includes(this.entitySearch.toLowerCase())
      );
    }
  }

}

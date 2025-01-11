import { Component } from '@angular/core';
import { EntityService } from '../shared/entities.service';
import { Router } from '@angular/router';
import { Entity } from '../shared/entity.model';

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
  constructor(private entityService: EntityService, private router: Router) {
    entitySearch: String;
  }

  ngOnInit() {
    this.entities = this.entityService.getEntity();
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


}
